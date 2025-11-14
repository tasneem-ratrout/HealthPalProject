import axios from "axios";

export const searchDrug = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: "Drug name is required" });
    }

    const url = `https://api.fda.gov/drug/label.json?search=${name}`;

    const response = await axios.get(url);

    const drug = response.data.results?.[0];

    if (!drug) {
      return res.status(404).json({ message: "Drug not found" });
    }

    res.json({
      brand_name: drug.openfda?.brand_name?.[0] || "Unknown",
      generic_name: drug.openfda?.generic_name?.[0] || "Unknown",
      purpose: drug.purpose?.[0] || "No info",
      indications: drug.indications_and_usage?.[0] || "No info",
      dosage: drug.dosage_and_administration?.[0] || "No info",
      warnings: drug.warnings?.[0] || "No info",
      side_effects: drug.adverse_reactions?.[0] || "No info",
      interactions: drug.drug_interactions?.[0] || "No info",
      manufacturer: drug.openfda?.manufacturer_name?.[0] || "Unknown"
    });

  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ message: "Error fetching drug info" });
  }
};
