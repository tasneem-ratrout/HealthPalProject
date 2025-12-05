import { pool } from "../db.js";

// ===============================
//  إضافة دواء أو جهاز (Donor / NGO)
// ===============================
export async function addMedicalItem(req, res) {
  try {
    if (!["ngo", "donor"].includes(req.user.role)) {
      return res.status(403).json({ error: "Only NGOs or Donors can add items." });
    }

    const { item_name, item_type, quantity, location } = req.body;
    if (!item_name || !item_type) {
      return res.status(400).json({ error: "item_name and item_type are required." });
    }

    const [result] = await pool.query(
      `INSERT INTO medical_items (item_name, item_type, quantity, donor_id, ngo_id, location, available)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        item_name.trim(),
        item_type,
        quantity || 1,
        req.user.role === "donor" ? req.user.id : null,
        req.user.role === "ngo" ? req.user.id : null,
        location || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Medical item added successfully.",
      item: {
        id: result.insertId,
        item_name,
        item_type,
        quantity: quantity || 1,
        location: location || "Not specified",
        added_by: req.user.name,
      },
    });
  } catch (err) {
    console.error("Error adding medical item:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

// ===============================
//  عرض كل الأدوية والمعدات المتاحة
// ===============================
export async function getAvailableItems(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, item_name, item_type, quantity, location, available, created_at
       FROM medical_items
       WHERE available = 1
       ORDER BY created_at DESC`
    );

    const formatted = rows.map((r) => ({
      id: r.id,
      item_name: r.item_name,
      item_type: r.item_type,
      quantity: r.quantity,
      location: r.location || "Not specified",
      added_at: new Date(r.created_at).toLocaleString("en-GB"),
    }));

    res.json({
      success: true,
      count: formatted.length,
      items: formatted,
    });
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

// ===============================
//  طلب دواء أو جهاز (Patient)
// ===============================
export async function requestMedicalAid(req, res) {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ error: "Only patients can request medical aid." });
    }

    const { item_id, description } = req.body;
    if (!item_id || !description) {
      return res.status(400).json({ error: "item_id and description are required." });
    }

    const [checkItem] = await pool.query(
      "SELECT id, item_name, available FROM medical_items WHERE id = ?",
      [item_id]
    );

    if (checkItem.length === 0) {
      return res.status(404).json({ error: "Requested item not found." });
    }

    if (!checkItem[0].available) {
      return res.status(400).json({ error: "This item is not currently available." });
    }

    const [result] = await pool.query(
      `INSERT INTO medical_aid (ngo_id, patient_id, item_id, description, status)
       VALUES (NULL, ?, ?, ?, 'pending')`,
      [req.user.id, item_id, description.trim()]
    );

    res.status(201).json({
      success: true,
      message: `Request submitted for ${checkItem[0].item_name}. Awaiting NGO approval.`,
      request_id: result.insertId,
      status: "pending",
    });
  } catch (err) {
    console.error("Error creating medical aid request:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

// ===============================
//  NGO موافقة أو رفض على طلب
// ===============================
export async function updateMedicalAidStatus(req, res) {
  try {
    if (req.user.role !== "ngo" && req.user.role !== "admin") {
      return res.status(403).json({ error: "Only NGOs or Admins can approve or reject requests." });
    }

    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${validStatuses.join(", ")}` });
    }

    const [check] = await pool.query("SELECT * FROM medical_aid WHERE id = ?", [id]);
    if (check.length === 0) {
      return res.status(404).json({ error: "Medical aid request not found." });
    }

    await pool.query(
      "UPDATE medical_aid SET status = ?, ngo_id = ? WHERE id = ?",
      [status, req.user.id, id]
    );

    if (status === "approved") {
      await pool.query("UPDATE medical_items SET available = 0 WHERE id = ?", [check[0].item_id]);
    }

    res.json({
      success: true,
      message: `Medical aid request #${id} has been ${status}.`,
    });
  } catch (err) {
    console.error("Error updating medical aid:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

// ===============================
//  تحديث حالة التوصيل (NGO فقط)
// ===============================
export async function updateDeliveryStatus(req, res) {
  try {
    if (req.user.role !== "ngo" && req.user.role !== "admin") {
      return res.status(403).json({ error: "Only NGOs or Admins can update delivery status." });
    }

    const { id } = req.params;
    const { delivery_status } = req.body;

    const validStatuses = ["in_delivery", "delivered"];
    if (!validStatuses.includes(delivery_status)) {
      return res.status(400).json({ error: `Invalid delivery status. Allowed: ${validStatuses.join(", ")}` });
    }

    const [check] = await pool.query("SELECT * FROM medical_aid WHERE id = ?", [id]);
    if (check.length === 0) {
      return res.status(404).json({ error: "Medical aid request not found." });
    }

    await pool.query("UPDATE medical_aid SET delivery_status = ? WHERE id = ?", [delivery_status, id]);

    res.json({
      success: true,
      message: `Delivery status updated to '${delivery_status}' for request #${id}.`,
    });
  } catch (err) {
    console.error("Error updating delivery status:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

// ===============================
//  عرض كل طلبات المريض مع حالتها
// ===============================
export async function getPatientRequests(req, res) {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ error: "Only patients can view their requests." });
    }

    const [rows] = await pool.query(
      `SELECT m.id, i.item_name, m.status, m.delivery_status, m.created_at
       FROM medical_aid m
       JOIN medical_items i ON m.item_id = i.id
       WHERE m.patient_id = ?
       ORDER BY m.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      total_requests: rows.length,
      requests: rows.map((r) => ({
        request_id: r.id,
        item: r.item_name,
        status: r.status,
        delivery_status: r.delivery_status,
        requested_at: new Date(r.created_at).toLocaleString("en-GB"),
      })),
    });
  } catch (err) {
    console.error("Error fetching patient requests:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
