const express = require('express'),
      router = new express.Router(),
      Favorite = require('../controllers/Favorite'),
      verifyToken = require('./serverAuth').verifyToken;


router.use(verifyToken);
router.post('/', Favorite.create);
router.delete('/:favorite_id', Favorite.destroy);

module.exports = router;