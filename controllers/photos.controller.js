const Photo = require('../models/photo.model');
const sanitizeHtml = require('sanitize-html');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    if(title && author && email && file) { // if fields are not empty...
      // Sanitize input to prevent HTML injection
      const sanitizedTitle = sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} });
      const sanitizedAuthor = sanitizeHtml(author, { allowedTags: [], allowedAttributes: {} });

      // Validate email using a simple regex
      const emailRegex = /^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/;


      if (
        emailRegex.test(email) &&
        sanitizedTitle.length <= 25 &&
        sanitizedAuthor.length <= 50
      ) {

      const fileName = file.path.split('/').slice(-1)[0];
      const fileExt = fileName.split('.').slice(-1)[0];

      if ((fileExt === 'jpg' || fileExt === 'png' || fileExt === 'gif')) {

        const newPhoto = new Photo({
          title: sanitizedTitle,
          author: sanitizedAuthor,
          email,
          src: fileName,
          votes: 0,
        });
        await newPhoto.save(); // ...save new photo in DB
        res.json(newPhoto);
      } else {
        throw new Error('Wrong file format!');
      }

      } else {
      throw new Error('Wrong input!');
      }
    } else {
      throw new Error('Missing required fields!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch(err) {
    res.status(500).json(err);
  }

};
