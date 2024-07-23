const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');
const isAuthorised = require('../middleware/auth');


router.post('/entries',  diaryController.createEntry);
 router.post('/:entryId/comments',  diaryController.addComment);
router.put('/entries/:entryId/disable-comments',  diaryController.disableComments);
router.delete('/entries/:entryId', diaryController.deleteEntry);
router.put('/entries/:entryId/like',  diaryController.likeEntry);
router.get('/entries',  diaryController.getEntries);
router.get('/entries/:entryId', diaryController.getEntry);
router.get('/entries/user/:userId', diaryController.getEntriesFromUser);

module.exports = router;
