import { pool } from '../db.js';

export const createWorkshop = async (req, res) => {
  try {
    const { title, description, date, time, location, type, organizer } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ message: "Title, date, and time are required." });
    }

    const [result] = await pool.query(
      `INSERT INTO workshops (title, description, date, time, location, type, organizer)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, date, time, location, type, organizer]
    );

    res.status(201).json({
      message: "Workshop created successfully",
      workshopId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating workshop:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getWorkshops = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM workshops ORDER BY date ASC`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getWorkshopById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT * FROM workshops WHERE id = ?`, [id]);

    if (rows.length === 0)
      return res.status(404).json({ message: "Workshop not found" });

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM workshops WHERE id = ?`, [id]);
    res.json({ message: "Workshop deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
