var express = require("express");
var router = express.Router();
var cookieParser = require("cookie-parser");

var Question = require("../../models/questions");
var User = require("../../models/user");
var Post = require("../../models/posts");
var Like = require("../../models/likes");

var mongoose = require("mongoose");

// Old User Log In
router.get("/", (req, res, next) => {
  let currentUser = req.cookies.currentUser;
  Post.find({ to: currentUser._id })
    .sort({ createdAt: -1 })
    .then(result => {
      res.render("navigation/profile", { currentUser, posts: result });
    });
});

router.post("/new/question", (req, res, next) => {
  let from = req.cookies.currentUser;
  let to = req.cookies.currentUser;
  let question = req.body.question;
  Question.create({ from, to, question }).then(question => {});
  res.redirect("/");
});

router.post("/delete", (req, res, next) => {
  Question.findByIdAndUpdate(req.body.questionId, { answered: false }).then(
    result => {
      Post.findByIdAndRemove(req.body.postId).then(post => {
        console.log(post);
        res.redirect("/");
      });
    }
  );
});

router.post("/answer/:id", (req, res, next) => {
  Question.findByIdAndUpdate(req.params.id, { answered: true }).then(result => {
    let { from, to, question } = result;
    let answer = req.body.answer;
    Post.create({ from, to, questionId: result, answer, question });
    res.redirect("../../account/inbox");
  });
});

router.post("/number-of-posts", (req, res, next) => {
  Post.find({ to: req.cookies.currentUser._id }).then(posts => {
    res.json({ npost: posts.length });
  });
});
router.post("/number-of-likes", (req, res, next) => {
  Like.find({ to: req.cookies.currentUser._id }).then(likes => {
    res.json({ nlike: likes.length });
  });
});

router.post("/:id/like", (req, res, next) => {
  Like.findOne({
    postId: req.params.id,
    from: req.cookies.currentUser,
    to: req.cookies.currentUser
  }).then(like => {
    if (like === null) {
      Post.findById(req.params.id).then(post => {
        let from = req.cookies.currentUser;
        let to = req.cookies.currentUser;
        Like.create({ from, to, postId: post }).then(like => {});
        res.json(like);
      });
    } else {
      Like.findOneAndRemove({
        postId: req.params.id,
        from: req.cookies.currentUser,
        to: req.cookies.currentUser
      }).then(deleted => {
        res.json(deleted);
      });
    }
  });
});

router.post("/:id", (req, res, next) => {
  Like.findOne({
    postId: req.params.id,
    from: req.cookies.currentUser,
    to: req.cookies.currentUser
  }).then(like => {
    if (like) {
      res.json({ liked: true });
    } else {
      res.json({ liked: false });
    }
  });
});

router.post("/:id/total-likes", (req, res, next) => {
  Like.find({
    to: req.cookies.currentUser,
    postId: req.params.id
  }).then(likes => {
    res.json({ nlikes: likes.length });
  });
});

module.exports = router;
