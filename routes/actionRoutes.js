const express = require("express");
const actionDB = require("../data/helpers/actionModel");
const projectDB = require("../data/helpers/projectModel");
const router = express.Router();
router.use(express.json());

router.get("/", (req,res) => {
  actionDB.get()
    .then(actions => res.status(200).json(actions))
    .catch(err => res.status(500).json({message:"Error retrieving information from the database"}));
});

router.get("/:id", validateActionId, (req,res) => {
  res.status(200).json(req.action);
});

router.post("/", validateAction, (req,res) => {
  projectDB.get(req.action.project_id)
  .then(foundProject => {
    if (foundProject) {
      actionDB.insert(req.action)
        .then(id => res.status(201).json({...id, ...req.action}))
        .catch(err => res.status(500).json({message:"Error saving to the database"}));
    } else {
      res.status(404).json({message: "Could not find project with specified project_id"});
    }
  })
  .catch(err => res.status(500).json({message:"Error retrieving information from the database"}));
});

router.put("/:id", [validateActionId, validateAction], (req,res) => {
  projectDB.get(req.action.project_id)
    .then(foundProject => {
      if (foundProject) {
        actionDB.update(req.params.id, req.action)
        .then(updatedAction => res.status(201).json(updatedAction))
        .catch(err => res.status(500).json({message:"Error updating the database"}));
      } else {
        res.status(404).json({message: "Could not find project with specified project_id"});
      }
    })
    .catch(err => res.status(500).json({message:"Error retrieving information from the database"}));
});

router.delete("/:id", [validateActionId], (req,res) => {
  actionDB.remove(req.params.id)
    .then(count => res.status(201).json({records_deleted: count}))
    .catch(err => res.status(500).json({message:"Error deleting from database"}));
});

function validateAction(req,res,next) {
  if (!req.body) {
    res.status(404).json({message: "Required body is missing"})
  } else if (!req.body.description || !req.body.notes || !req.body.project_id) {
    res.status(404).json({message: "description, notes, and project_id required"});
  } else {
    req.action = req.body;
    next();
  }
}

function validateActionId(req,res,next) {
  let id = req.params.id;
  actionDB.get(id)
    .then(foundAction => {
      if (foundAction) {
        req.action = foundAction;
        next();
      } else {
        res.status(404).json({message: "Could not find action with specified id"});
      }
    })
    .catch(err => res.status(500).json({message:"Error retrieving information from the database"}));
};

module.exports = router;