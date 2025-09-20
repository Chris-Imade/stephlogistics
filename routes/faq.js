const express = require('express');
const router = express.Router();

// GET faq page
router.get('/', (req, res) => {
  res.render('faq', {
    title: 'Frequently Asked Questions',
    path: '/faq',
  });
});

module.exports = router;
