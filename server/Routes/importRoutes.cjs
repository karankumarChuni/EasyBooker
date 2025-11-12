const express = require('express');
const router = express.Router();
const importController = require('../controllers/importController.cjs');

router.post('/trigger', importController.triggerImport);
router.get('/history', importController.getImportHistory);
router.get('/history/:id', importController.getImportById);
router.get('/queue-stats', importController.getQueueStats);

module.exports = router;
