const express = require("express");
const projectDB = require("../data/helpers/projectModel");
const router = express.Router();
router.use(express.json());

router.get("/", (req,res) => {
  projectDB.get()
    .then(projects => res.status(200).json(projects));
});

router.get("/:id", validateProjectId, (req,res) => {
  res.status(200).json(req.project);
});

router.get("/:id/actions", validateProjectId, (req,res) => {
  projectDB.getProjectActions(req.params.id)
    .then(actions => res.status(200).json(actions));
})

router.post("/", validateProject, (req,res) => {
  projectDB.insert(req.project)
    .then(id => res.status(201).json({...id, ...req.project}));
});

function validateProject(req,res,next) {
  if (!req.body) {
    res.status(404).json({message: "Required body is missing"})
  } else if (!req.body.name || !req.body.description) {
    res.status(404).json({message: "Project name and description required"});
  } else {
    req.project = req.body;
    next();
  }
}

function validateProjectId(req,res,next) {
  let id = req.params.id;
  projectDB.get(id)
    .then(foundProject => {
      if (foundProject) {
        req.project = foundProject;
        next();
      } else {
        res.status(404).json({message: "Could not find project with specified id"});
      }
    })
};


module.exports = router;