const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

app.use(express.json());

// Koneksi ke MongoDB Atlas
mongoose.connect('mongodb+srv://lutfiarief:kKikFvs1z4iHXypi@cluster7.wmfjj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster7', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// Skema Todo
const todoSchema = new mongoose.Schema({
    description: { type: String, required: true },
    date: { type: String, required: true },
    is_checked: { type: Boolean, default: false }
});

// Model Todo
const Todo = mongoose.model('Todo', todoSchema);

// Validasi input POST
const validatePostInput = (req, res, next) => {
    const { description, date } = req.body;
    if (!description || !date) {
        return res.status(400).json({ error: 'Description dan date harus diisi.' });
    }
    next();
};

// Validasi input PUT
const validatePutInput = (req, res, next) => {
    const { description, date } = req.body;
    if (!description || !date) {
        return res.status(400).json({ error: 'Hanya boleh mengubah description dan date.' });
    }
    next();
};

// GET /todos: Menampilkan semua todo
app.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data todos.' });
    }
});

// POST /todos: Membuat todo baru
app.post('/todos', validatePostInput, async (req, res) => {
    const { description, date } = req.body;

    try {
        let todo = new Todo({ description, date });
        todo = await todo.save();
        res.status(201).json(todo);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan saat membuat todo.' });
    }
});

// PUT /todos/:id: Mengupdate todo berdasarkan id
app.put('/todos/:id', validatePutInput, async (req, res) => {
    const { description, date } = req.body;

    try {
        const todo = await Todo.findByIdAndUpdate(
            req.params.id,
            { description, date },
            { new: true }
        );

        if (!todo) {
            return res.status(404).json({ error: 'Todo tidak ditemukan.' });
        }

        res.json(todo);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan saat mengupdate todo.' });
    }
});

// DELETE /todos/:id: Menghapus todo berdasarkan id
app.delete('/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findByIdAndRemove(req.params.id);

        if (!todo) {
            return res.status(404).json({ error: 'Todo tidak ditemukan.' });
        }

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan saat menghapus todo.' });
    }
});

// PATCH /todos/:id/toggle: Mengubah status is_checked todo
app.patch('/todos/:id/toggle', async (req, res) => {
    try {
        let todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ error: 'Todo tidak ditemukan.' });
        }

        todo.is_checked = !todo.is_checked;
        todo = await todo.save();

        res.json(todo);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan saat mengubah status todo.' });
    }
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
