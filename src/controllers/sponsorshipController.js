import { pool } from '../db.js';

// ===============================
// إنشاء حالة طبية جديدة (patient case)
// ===============================
export async function createPatientCase(req, res) {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ error: "Only patients can create medical cases" });
    }

    const { title, diagnosis, treatment_type, goal_amount } = req.body;

    if (!title || !treatment_type || !goal_amount) {
      return res
        .status(400)
        .json({ error: "Title, treatment_type, and goal_amount are required" });
    }

    //check if amount is positive
    if (goal_amount <= 0) {
      return res
        .status(400)
        .json({ error: "Goal amount must be greater than zero." });
    }

    const cleanTitle = title.trim();
    const cleanDiagnosis = diagnosis ? diagnosis.trim() : "";
    const cleanType = treatment_type.trim();

    const [result] = await pool.query(
      `
      INSERT INTO patient_cases (patient_id, title, diagnosis, treatment_type, goal_amount, status)
      VALUES (?, ?, ?, ?, ?, 'open')
      `,
      [req.user.id, cleanTitle, cleanDiagnosis, cleanType, goal_amount]
    );

    const formattedDate = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    res.status(201).json({
      success: true,
      message: `Medical case "${cleanTitle}" created successfully and is now open for donations.`,
      case: {
        id: result.insertId,
        title: cleanTitle,
        diagnosis: cleanDiagnosis,
        treatment_type: cleanType,
        goal_amount,
        status: "open",
        created_at: formattedDate,
      },
    });
  } catch (err) {
    console.error(" Error creating medical case:", err);
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
}

// ===============================
// عرض جميع الحالات المفتوحة  
// Patient → sees only their own cases.
// Donor & NGO &Admin → see all open cases
// ===============================
export async function getAllPatientCases(req, res) {
  try {
    const role = req.user.role;
    let query = "";
    let params = [];

  
    if (role === "patient") {
      query = `
        SELECT 
          id, title, diagnosis, treatment_type, goal_amount, raised_amount, status, created_at
        FROM patient_cases
        WHERE patient_id = ?
        ORDER BY created_at DESC
      `;
      params = [req.user.id];
    }

    
    else if (["donor", "ngo", "admin"].includes(role)) {
      query = `
        SELECT 
          c.*, 
          u.name AS patient_name
        FROM patient_cases c
        JOIN users u ON c.patient_id = u.id
        WHERE c.status = 'open'
        ORDER BY c.created_at DESC
      `;
    }

    else {
      return res.status(403).json({
        success: false,
        error: "You are not allowed to view patient cases.",
      });
    }

    
    const [rows] = await pool.query(query, params);

    const formattedCases = rows.map((c) => {
      const formattedDate = new Date(c.created_at).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const progress =
        c.goal_amount > 0
          ? ((Number(c.raised_amount) / Number(c.goal_amount)) * 100).toFixed(1)
          : 0;

      return {
        id: c.id,
        title: c.title,
        diagnosis: c.diagnosis || "No diagnosis info",
        treatment_type: c.treatment_type,
        goal_amount: Number(c.goal_amount),
        raised_amount: Number(c.raised_amount),
        progress_percent: `${progress}%`,
        status: c.status,
        ...(role !== "patient" && { patient_name: c.patient_name }),
        created_at: formattedDate,
      };
    });

  
    const message =
      role === "patient"
        ? "Here are your own medical cases."
        : "Open patient cases available for sponsorship.";

    res.status(200).json({
      success: true,
      count: formattedCases.length,
      message,
      cases: formattedCases,
    });
  } catch (err) {
    console.error(" Error fetching cases:", err);
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
}


// ===============================
//  إنشاء تبرع جديد ( only ngo and doner)
// ===============================
export async function createDonation(req, res) {
  try {
    if (req.user.role !== "donor" && req.user.role !== "ngo") {
      return res
        .status(403)
        .json({ error: "Only donors or NGOs can create donations." });
    }

    const { case_id, amount, note } = req.body;

    if (!case_id || !amount) {
      return res
        .status(400)
        .json({ error: "case_id and amount are required." });
    }

    if (amount <= 0) {
      return res
        .status(400)
        .json({ error: "Donation amount must be greater than zero." });
    }

    const [caseRows] = await pool.query(
      `SELECT id, title, patient_id, status, goal_amount, raised_amount 
       FROM patient_cases 
       WHERE id = ?`,
      [case_id]
    );

    if (caseRows.length === 0) {
      return res.status(404).json({ error: "Patient case not found." });
    }

    const selectedCase = caseRows[0];

    if (selectedCase.status !== "open") {
      return res
        .status(400)
        .json({ error: "This case is not open for donations." });
    }

    const patient_id = selectedCase.patient_id;
    const remainingAmount =
      selectedCase.goal_amount - selectedCase.raised_amount;

    if (remainingAmount <= 0) {
      return res.status(400).json({
        error: "This case has already reached its funding goal.",
      });
    }

    if (amount > remainingAmount) {
      return res.status(400).json({
        error: `Donation exceeds required goal amount. Only $${remainingAmount} is needed to complete funding.`,
      });
    }

    await pool.query(
      `
      INSERT INTO donations (donor_id, patient_id, case_id, amount, note)
      VALUES (?, ?, ?, ?, ?)
      `,
      [req.user.id, patient_id, case_id, amount, note || null]
    );

    await pool.query(
      `
      UPDATE patient_cases
      SET raised_amount = raised_amount + ?
      WHERE id = ?
      `,
      [amount, case_id]
    );

    const [updatedCase] = await pool.query(
      `SELECT raised_amount, goal_amount, title FROM patient_cases WHERE id = ?`,
      [case_id]
    );

    const raised = Number(updatedCase[0].raised_amount);
    const goal = Number(updatedCase[0].goal_amount);
    const progress = ((raised / goal) * 100).toFixed(1);

    if (raised >= goal) {
      await pool.query(
        `UPDATE patient_cases SET status = 'funded' WHERE id = ?`,
        [case_id]
      );
    }

    const formattedDate = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });


    res.status(201).json({
      success: true,
      message:
        raised >= goal
          ? ` Donation of $${amount} completed full funding for "${updatedCase[0].title}". Case marked as funded.`
          : ` Donation of $${amount} added successfully to "${updatedCase[0].title}".`,
      donation: {
        donor_id: req.user.id,
        case_id,
        patient_id,
        amount,
        note: note || "",
        created_at: formattedDate,
        case_progress: `${progress}%`,
        total_raised: raised,
        goal_amount: goal,
        status: raised >= goal ? "funded" : "open",
      },
    });
  } catch (err) {
    console.error(" Error creating donation:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}


// ===============================
//  عرض تبرعات المستخدم الحالي (donor and ngo)
// ===============================
export async function getMyDonations(req, res) {
  try {

    if (req.user.role !== "donor" && req.user.role !== "ngo") {
      return res
        .status(403)
        .json({ error: "Only donors or NGOs can view their donations." });
    }

    const [rows] = await pool.query(
      `
      SELECT 
        d.id,
        d.amount,
        d.note,
        d.created_at,
        c.id AS case_id,
        c.title AS case_title,
        c.goal_amount,
        c.raised_amount,
        u.name AS patient_name
      FROM donations d
      JOIN patient_cases c ON d.case_id = c.id
      JOIN users u ON c.patient_id = u.id
      WHERE d.donor_id = ?
      ORDER BY d.created_at DESC
      `,
      [req.user.id]
    );

    const formatted = rows.map((d) => {
      const date = new Date(d.created_at).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const progress = ((d.raised_amount / d.goal_amount) * 100).toFixed(1);

      return {
        donation_id: d.id,
        case_id: d.case_id,
        case_title: d.case_title,
        patient_name: d.patient_name,
        amount: d.amount,
        note: d.note || "—",
        donated_at: date,
        goal_amount: d.goal_amount,
        raised_amount: d.raised_amount,
        case_progress: `${progress}%`
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      donations: formatted,
    });
  } catch (err) {
    console.error(" Error fetching donations:", err);
    res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
}

// ===============================
//  إضافة إيصال جديد (Receipt)
// ===============================
export async function addReceipt(req, res) {
  try {
  
    if (!["doctor", "ngo", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        error: "Only doctors, NGOs, or admins can add medical reports.",
      });
    }

    const { case_id, report, description } = req.body;

    if (!case_id || !report) {
      return res
        .status(400)
        .json({ error: "case_id and report are required." });
    }


    const [caseCheck] = await pool.query(
      `SELECT id, title, status FROM patient_cases WHERE id = ?`,
      [case_id]
    );

    if (caseCheck.length === 0) {
      return res.status(404).json({ error: "Patient case not found." });
    }

    const selectedCase = caseCheck[0];


    if (!["funded", "closed"].includes(selectedCase.status)) {
      return res.status(400).json({
        error: "Reports can only be added for funded or closed cases.",
      });
    }

    
    const [result] = await pool.query(
      `
      INSERT INTO receipts (case_id, file_url, description)
      VALUES (?, ?, ?)
      `,
      [case_id, report.trim(), description || ""]
    );

  
    if (selectedCase.status === "funded") {
      await pool.query(
        `UPDATE patient_cases SET status = 'closed' WHERE id = ?`,
        [case_id]
      );
    }

    
    const formattedDate = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  
    res.status(201).json({
      success: true,
      message: `Medical report added successfully for case "${selectedCase.title}".`,
      report: {
        id: result.insertId,
        case_id,
        case_title: selectedCase.title,
        report,
        notes: description || "No additional notes provided",
        added_by: req.user.name,
        role: req.user.role,
        added_at: formattedDate,
        new_status:
          selectedCase.status === "funded" ? "closed" : selectedCase.status,
      },
    });
  } catch (err) {
    console.error(" Error adding report:", err);
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
}

// ===============================
// get Receipts By Case
// ===============================
export async function getReceiptsByCase(req, res) {
  try {
    const { case_id } = req.params;

   
    if (!case_id) {
      return res.status(400).json({ error: "case_id is required." });
    }

    
    const [caseRows] = await pool.query(
      `SELECT id, title, patient_id, status FROM patient_cases WHERE id = ?`,
      [case_id]
    );

    if (caseRows.length === 0) {
      return res.status(404).json({ error: "Patient case not found." });
    }

    const selectedCase = caseRows[0];

   

    const allowedRoles = ["doctor", "ngo", "admin", "donor", "patient"];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied." });
    }

   
    if (req.user.role === "patient" && req.user.id !== selectedCase.patient_id) {
      return res
        .status(403)
        .json({ error: "You can only view your own case reports." });
    }

    
    if (req.user.role === "doctor" && !["funded", "closed"].includes(selectedCase.status)) {
      return res
        .status(403)
        .json({ error: "Doctors can only view reports of funded or closed cases." });
    }

  
    if (req.user.role === "donor") {
      const [donations] = await pool.query(
        `SELECT id FROM donations WHERE donor_id = ? AND case_id = ?`,
        [req.user.id, case_id]
      );
      if (donations.length === 0) {
        return res.status(403).json({
          error: "You can only view reports for cases you donated to.",
        });
      }
    }

   
    const [rows] = await pool.query(
      `
      SELECT r.id, r.file_url AS report, r.description, r.uploaded_at
      FROM receipts r
      WHERE r.case_id = ?
      ORDER BY r.uploaded_at DESC
      `,
      [case_id]
    );

    
    const formattedReceipts = rows.map((r) => {
      const formattedDate = new Date(r.uploaded_at).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        id: r.id,
        report: r.report || "No report provided",
        description: r.description || "No description provided",
        uploaded_at: formattedDate,
      };
    });

    res.status(200).json({
      success: true,
      message: `Retrieved ${formattedReceipts.length} report(s) for case "${selectedCase.title}".`,
      case_title: selectedCase.title,
      case_status: selectedCase.status,
      reports: formattedReceipts,
    });
  } catch (err) {
    console.error(" Error fetching case reports:", err);
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
}

// ===============================
// عرض جميع الحالات الخاصة بمريض معين (Patient Profile)
// ===============================
export async function getPatientCases(req, res) {
  try {
    const { id } = req.params;

  
    const [patientRows] = await pool.query(
      `SELECT id, name, role FROM users WHERE id = ? AND role = 'patient'`,
      [id]
    );

    if (patientRows.length === 0) {
      return res.status(404).json({ error: "Patient not found." });
    }

    const patient = patientRows[0];

    
    if (
      req.user.role === "patient" &&
      req.user.id !== patient.id
    ) {
      return res.status(403).json({
        error: "You can only view your own medical cases."
      });
    }

    const [cases] = await pool.query(
      `
      SELECT id, title, diagnosis, treatment_type, goal_amount, raised_amount, status, created_at
      FROM patient_cases
      WHERE patient_id = ?
      ORDER BY created_at DESC
      `,
      [id]
    );

    if (cases.length === 0) {
      return res.json({
        success: true,
        patient_name: patient.name,
        total_cases: 0,
        message: "This patient has no medical cases yet.",
        cases: []
      });
    }


    const detailedCases = await Promise.all(
      cases.map(async (c) => {
        const [donations] = await pool.query(
          `
          SELECT d.amount, d.note, u.name AS donor_name, d.created_at
          FROM donations d
          JOIN users u ON d.donor_id = u.id
          WHERE d.case_id = ?
          ORDER BY d.created_at DESC
          `,
          [c.id]
        );

        const [receipts] = await pool.query(
          `
          SELECT id, file_url AS report, description, uploaded_at
          FROM receipts
          WHERE case_id = ?
          ORDER BY uploaded_at DESC
          `,
          [c.id]
        );

        return {
          id: c.id,
          title: c.title,
          diagnosis: c.diagnosis,
          treatment_type: c.treatment_type,
          goal_amount: c.goal_amount,
          raised_amount: c.raised_amount,
          progress: `${((c.raised_amount / c.goal_amount) * 100).toFixed(1)}%`,
          status: c.status,
          created_at: new Date(c.created_at).toLocaleString("en-GB"),
          donations: donations.map((d) => ({
            donor_name: d.donor_name,
            amount: d.amount,
            note: d.note || "—",
            donated_at: new Date(d.created_at).toLocaleString("en-GB")
          })),
          reports: receipts.map((r) => ({
            report: r.report,
            description: r.description || "No description",
            uploaded_at: new Date(r.uploaded_at).toLocaleString("en-GB")
          }))
        };
      })
    );

    res.status(200).json({
      success: true,
      patient_name: patient.name,
      total_cases: detailedCases.length,
      cases: detailedCases
    });
  } catch (err) {
    console.error(" Error fetching patient cases:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}



// ===============================
// (Transparency Dashboard)
// لعرض كل الحالات الممولة والتقارير الخاصة بها
// ===============================
export async function getTransparencyDashboard(req, res) {
  try {
   
    if (!["admin", "ngo"].includes(req.user.role)) {
      return res.status(403).json({
        error: "Only admins or NGOs can access the transparency dashboard."
      });
    }

  
    const [cases] = await pool.query(`
      SELECT 
        c.id, c.title, c.treatment_type, c.goal_amount, c.raised_amount, c.status, c.created_at,
        u.name AS patient_name
      FROM patient_cases c
      JOIN users u ON c.patient_id = u.id
      WHERE c.status IN ('funded', 'closed')
      ORDER BY c.created_at DESC
    `);

   
    const dashboardData = await Promise.all(
      cases.map(async (c) => {
        const [receipts] = await pool.query(
          `
          SELECT file_url AS report, description, uploaded_at
          FROM receipts
          WHERE case_id = ?
          ORDER BY uploaded_at DESC
          `,
          [c.id]
        );

        return {
          case_id: c.id,
          title: c.title,
          patient_name: c.patient_name,
          treatment_type: c.treatment_type,
          goal_amount: c.goal_amount,
          raised_amount: c.raised_amount,
          progress: `${((c.raised_amount / c.goal_amount) * 100).toFixed(1)}%`,
          status: c.status,
          reports: receipts.map((r) => ({
            report: r.report,
            description: r.description,
            uploaded_at: new Date(r.uploaded_at).toLocaleString("en-GB")
          }))
        };
      })
    );

    res.status(200).json({
      success: true,
      total_funded_cases: dashboardData.length,
      dashboard: dashboardData
    });
  } catch (err) {
    console.error(" Error fetching transparency dashboard:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

