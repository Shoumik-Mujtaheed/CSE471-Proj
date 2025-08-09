import csv from "csvtojson";

/**
 * Parses a CSV file buffer for bulk medicine upload.
 * Returns an array of objects, one per medicine.
 * @param {Buffer} csvBuffer - file.buffer from multer
 * @returns {Promise<Array<{ name: string, price: string, quantity?: string }>>}
 */
const parseMedicineCSV = async (csvBuffer) => {
  try {
    // Convert Buffer to string
    const csvString = csvBuffer.toString();
    // Parse CSV to array of JS objects
    const records = await csv({
      trim: true,
      ignoreEmpty: true
    }).fromString(csvString);

    // You may optionally post-process records here (e.g., clean names/prices)
    // For example: filter out rows missing name or price
    const medicines = records
      .filter((row) => row.name && row.price)
      .map((row) => ({
        name: row.name.trim(),
        price: row.price.trim(),
        quantity: row.quantity ? row.quantity.trim() : undefined,
      }));

    return medicines;
  } catch (err) {
    throw new Error("Error parsing CSV: " + err.message);
  }
};

export default parseMedicineCSV;
