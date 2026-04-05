const express = require('express');
const router = express.Router();
const { getLectures, createLecture, getLectureById } = require('../controllers/lectureController');

router.get('/', getLectures);
router.post('/', createLecture);
router.get('/:id', getLectureById);

module.exports = router;