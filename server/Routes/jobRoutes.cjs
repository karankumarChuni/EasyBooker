const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController.cjs');

router.get('/', jobController.getAllJobs);
router.get('/stats', jobController.getJobStats);
router.get('/:id', jobController.getJobById);

module.exports = router;
