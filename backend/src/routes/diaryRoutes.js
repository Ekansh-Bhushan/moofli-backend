const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');
const streakController= require('../controllers/streakController');
const { isAuthorised } = require('../middleware/auth');
const {
    dairyPicUploader
} = require("../uploads/handleUploads");

// Apply isAuthorised middleware to routes that require authorization
router.post('/dairyCreate',isAuthorised, dairyPicUploader, diaryController.createEntry);
router.put('/dairyupdate/:entryId',isAuthorised, dairyPicUploader, diaryController.updateEntry);
router.post('/:entryId/comments', isAuthorised, diaryController.addComment);
router.put('/entries/:entryId/disable-comments', isAuthorised, diaryController.disableComments);
router.delete('/entries/:entryId', isAuthorised, diaryController.deleteEntry);
router.put('/entries/:entryId/like', isAuthorised, diaryController.likeEntry);
router.get('/entries', isAuthorised, diaryController.getEntries);
router.get('/entries/:entryId', isAuthorised, diaryController.getEntry);
router.get('/entries/user/:userId', isAuthorised, diaryController.getEntriesFromUser);

router.get('/streakTillNow',isAuthorised, streakController.getStreak)

module.exports = router;
