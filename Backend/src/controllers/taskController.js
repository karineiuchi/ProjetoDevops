const db = require('../database/db');

// Função pra converter 0/1 em boolean
const convertTask = (task) => {
    if (task) {
        task.completed = task.completed === 1 ? true : false;
    }
    return task;
};

const taskController = {
    // GET /tasks
    getAllTasks: (req, res) => {
        db.all('SELECT * FROM tasks ORDER BY id', [], (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            // Converte todas as tarefas
            const tasks = rows.map(task => convertTask(task));
            res.json(tasks);
        });
    },

    // POST /tasks
    createTask: (req, res) => {
        const { text, completed = false } = req.body;
        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'Texto é obrigatório' });
        }

        db.run('INSERT INTO tasks (text, completed) VALUES (?, ?)', [text, completed], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            res.status(201).json({
                id: this.lastID,
                text: text,
                completed: completed  // já vem boolean do body
            });
        });
    },

    // PUT /tasks/:id
    updateTask: (req, res) => {
        const id = parseInt(req.params.id);
        const { text, completed } = req.body;

        let query = 'UPDATE tasks SET ';
        let params = [];

        if (text !== undefined) {
            query += 'text = ?, ';
            params.push(text);
        }
        if (completed !== undefined) {
            query += 'completed = ?, ';
            params.push(completed);
        }

        query = query.slice(0, -2) + ' WHERE id = ?';
        params.push(id);

        db.run(query, params, function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            if (this.changes === 0) {
                res.status(404).json({ error: 'Tarefa não encontrada' });
                return;
            }

            db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                // Converte a tarefa antes de retornar
                res.json(convertTask(row));
            });
        });
    },

    // DELETE /tasks/:id
    deleteTask: (req, res) => {
        const id = parseInt(req.params.id);

        db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            if (this.changes === 0) {
                res.status(404).json({ error: 'Tarefa não encontrada' });
                return;
            }

            res.status(204).send();
        });
    }
};

module.exports = taskController;