const DiaryEntry = require('../models/diary');
const Comment = require('../models/commentForDairy');
const User = require('../models/user'); 
// const isAuthorised = require('../middleware/auth');
const Notification = require('../models/notification');
const notificationController = require('./userNotification');
const { updateStreak } = require("./streakController");

exports.createEntry = async (req, res) => {
    try {
      console.log("Received Body:", req.body);
      console.log("Received File:", req.file);  // 🔍 Debugging line
  
      const { content, publicdairy } = req.body;
      let dairyPicUrl = null;
  
      if (req.file) {
        console.log("File Field Name:", req.file.fieldname);  // 🔍 Debugging line
        if (req.file.fieldname === "dairyPic") {
          dairyPicUrl =
            process.env.BASE_URL +
            "/api/public/users/" +
            req.file.filename;
        }
      } else {
        console.log("No file received"); // 🔍 Debugging log
      }
  
      const newEntry = new DiaryEntry({
        user: req.user._id,
        content,
        publicdairy,
        dairyPicUrl
      });
  
      await newEntry.save();
      console.log("Entry saved:", newEntry); // 🔍 Debugging log
  
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).send({
          result: false,
          message: "User not found",
        });
      }
      if (!user.entries) {
        user.entries = [];
      }
  
      user.entries.push(newEntry._id);
      await user.save();
  
      await updateStreak(req.user._id);
  
      res.status(201).send({
        result: newEntry,
        message: "Diary entry created successfully",
      });
    } catch (err) {
      console.error("Error:", err.message); // 🔍 Debugging log
      res.status(500).send({
        result: false,
        err: err.message,
        message: "Internal server error",
      });
    }
  };
  
  exports.updateEntry = async (req, res) => {
    try {
        console.log(req.body)
      const { content, publicdairy, removePhoto } = req.body;
      const entryId = req.params.entryId; // This is the ID of the entry being updated
      const shouldRemovePhoto = removePhoto === 'true' || removePhoto === true;
      console.log(shouldRemovePhoto)
      // Fetch the existing entry by ID
      const entry = await DiaryEntry.findById(entryId);
      if (!entry) {
        return res.status(404).send({
          result: false,
          message: "Diary entry not found",
        });
      }
  
      // Only allow the owner of the entry to update
      if (entry.user.toString() !== req.user._id.toString()) {
        return res.status(403).send({
          result: false,
          message: "You are not authorized to update this entry",
        });
      }
  
      // Update content and publicdairy fields if provided
      if (content !== undefined) {
        entry.content = content;
      }
  
      if (publicdairy !== undefined) {
        entry.publicdairy = publicdairy;
      }
      console.log("adsfasdfadf")
      // Handle file upload (photo update or removal)
      if (req.file) {
        // If a new photo is uploaded, update the photo URL
        console.log("i am at the file if block")
        console.log("File Field Name:", req.file.fieldname);  // 🔍 Debugging line
        if (req.file.fieldname === "dairyPic") {
            entry.dairyPicUrl =
            process.env.BASE_URL +
            "/api/public/users/" +
            req.file.filename;
        }
      }
  
      // Handle photo removal
      if (shouldRemovePhoto) {
        console.log("i am at the remove blcok")
        entry.dairyPicUrl = null;
      }
      console.log("exit the blocks")
      // Save the updated entry
      await entry.save();
  
      res.status(200).send({
        result: entry,
        message: "Diary entry updated successfully",
      });
    } catch (err) {
      res.status(500).send({
        result: false,
        err: err.message,
        message: "Internal server error",
      });
    }
  };
  
  
  
exports.addComment = async (req, res) => {
  try {
    const entry = await DiaryEntry.findById(req.params.entryId);
    if (!entry) {
      return res.status(404).send({ message: 'Entry not found' });
    }

    entry.comments.push(req.body.commentId);
    await entry.save();

    res.status(200).send({ message: 'Comment added successfully', entry });
  } catch (err) {
    res.status(500).send({ message: 'Internal server error', error: err.message });
  }
};

exports.disableComments = async (req, res) => {
  try {
    const entry = await DiaryEntry.findById(req.params.entryId);
    if (!entry) {
      return res.status(404).send({ message: 'Entry not found' });
    }

    entry.deactivateComments = true;
    await entry.save();

    res.status(200).send({ message: 'Comments disabled successfully', entry });
  } catch (err) {
    res.status(500).send({ message: 'Internal server error', error: err.message });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const entry = await DiaryEntry.findByIdAndDelete(req.params.entryId);
    if (!entry) {
      return res.status(404).send({ message: 'Entry not found' });
    }

    res.status(200).send({ message: 'Entry deleted successfully' });
  } catch (err) {
    res.status(500).send({ message: 'Internal server error', error: err.message });
  }
};

exports.likeEntry = async (req, res) => {
  try {
    const entry = await DiaryEntry.findById(req.params.entryId);
    if (!entry) {
      return res.status(404).send({ message: 'Entry not found' });
    }

    if (!entry.likes.includes(req.user._id)) {
      entry.likes.push(req.user._id);
      await entry.save();
    }

    res.status(200).send({ message: 'Entry liked successfully', entry });
  } catch (err) {
    res.status(500).send({ message: 'Internal server error', error: err.message });
  }
};

exports.getEntries = async (req, res) => {
  try {
    const entries = await DiaryEntry.find({ user: req.user._id });
    res.status(200).send({ entries });
  } catch (err) {
    res.status(500).send({ message: 'Internal server error', error: err.message });
  }
};

exports.getEntry = async (req, res) => {
  try {
    const entry = await DiaryEntry.findById(req.params.entryId);
    if (!entry) {
      return res.status(404).send({ message: 'Entry not found' });
    }

    res.status(200).send({ entry });
  } catch (err) {
    res.status(500).send({ message: 'Internal server error', error: err.message });
  }
};

exports.getEntriesFromUser = async (req, res) => {
  try {
    const entries = await DiaryEntry.find({ user: req.params.userId, publicdairy: true });
    res.status(200).send({ entries });
  } catch (err) {
    res.status(500).send({ message: 'Internal server error', error: err.message });
  }
};

