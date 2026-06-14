export function createCrudController(Model, options = {}) {
  return {
    async list(req, res) {
      const query = { userId: req.user._id };
      const docs = await Model.find(query).sort(options.sort || { createdAt: -1 }).populate(options.populate || "");
      res.json(docs);
    },
    async create(req, res) {
      const doc = await Model.create({ ...req.body, userId: req.user._id });
      res.status(201).json(doc);
    },
    async update(req, res) {
      const doc = await Model.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true }
      );
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.json(doc);
    },
    async remove(req, res) {
      const doc = await Model.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.status(204).end();
    }
  };
}
