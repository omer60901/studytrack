import { Router } from "express";
import { createCrudController } from "../controllers/crudController.js";
import { Exam } from "../models/Exam.js";
import { StudySession } from "../models/StudySession.js";
import { Subject } from "../models/Subject.js";
import { Task } from "../models/Task.js";

function resource(Model, options) {
  const router = Router();
  const controller = createCrudController(Model, options);
  router.get("/", controller.list);
  router.post("/", controller.create);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);
  return router;
}

export const taskRoutes = resource(Task, { populate: "subjectId", sort: { dueDate: 1 } });
export const subjectRoutes = resource(Subject, { sort: { name: 1 } });
export const examRoutes = resource(Exam, { populate: "subjectId", sort: { examDate: 1 } });
export const sessionRoutes = resource(StudySession, { populate: "subjectId", sort: { completedAt: -1 } });
