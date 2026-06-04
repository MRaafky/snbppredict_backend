const EarlyWarning = require('../models/EarlyWarning');
const {
  isUsingDatabase,
  getInMemoryWarnings,
  setInMemoryWarnings
} = require('../config/dataStore');

// ================================================
// GET SEMUA WARNING
// GET /api/v1/warnings
// ================================================
const getAllWarnings = async (req, res) => {
  try {
    let data;

    if (isUsingDatabase()) {
      data = await EarlyWarning.findAll({
        order: [['created_at', 'DESC']]
      });
    } else {
      data = getInMemoryWarnings();
    }

    res.json({ success: true, total: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================================
// PUT TANDAI WARNING SUDAH DIBACA
// PUT /api/v1/warnings/:id/read
// ================================================
const markAsRead = async (req, res) => {
  try {
    if (isUsingDatabase()) {
      const warning = await EarlyWarning.findByPk(req.params.id);
      if (!warning) {
        return res.status(404).json({
          success: false,
          message: 'Warning tidak ditemukan'
        });
      }
      await warning.update({ is_read: true });
    } else {
      const list  = getInMemoryWarnings();
      const index = list.findIndex(w => w.id === parseInt(req.params.id));
      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: 'Warning tidak ditemukan'
        });
      }
      list[index].is_read = true;
      setInMemoryWarnings(list);
    }

    res.json({
      success: true,
      message: 'Warning berhasil ditandai sudah dibaca'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllWarnings, markAsRead };
