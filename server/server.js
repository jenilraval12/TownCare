const express = require("express");
const cors = require("cors");

const db = require("./db");

const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "TownCare server is running."
    });
});

app.post("/api/auth/login", (req, res) => {

    const { house_no, phone_no, password } = req.body;

    if (!house_no || !phone_no || !password) {
        return res.status(400).json({
            message: "All fields are required."
        });
    }

    const sql = `
        SELECT id, house_no, username, phone_no, role
        FROM users
        WHERE house_no = ?
        AND phone_no = ?
        AND password = ?
        AND status = 'approved'
    `;

    db.query(
        sql,
        [house_no, phone_no, password],
        (err, results) => {

            if (err) {
                console.error("Database error:", err);

                return res.status(500).json({
                    message: "Database error."
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    message: "Invalid house number, mobile number or password."
                });
            }

            const user = results[0];

            res.status(200).json({
                message: "Login successful.",
                user: user
            });
        }
    );
});

app.listen(PORT, () => {
    console.log(`TownCare server running at http://localhost:${PORT}`);
});

app.post("/api/auth/register", (req, res) => {

    const {
        house_no,
        username,
        phone_no,
        password
    } = req.body;

    if (!house_no || !username || !phone_no || !password) {
        return res.status(400).json({
            message: "All fields are required."
        });
    }

    const checkSql = `
        SELECT id
        FROM users
        WHERE house_no = ?
        OR phone_no = ?
    `;

    db.query(
        checkSql,
        [house_no, phone_no],
        (err, results) => {

            if (err) {
                console.error("Database error:", err);

                return res.status(500).json({
                    message: "Database error."
                });
            }

            if (results.length > 0) {

                return res.status(409).json({
                    message: "House number or mobile number is already registered."
                });
            }

            const insertSql = `
                INSERT INTO users
                (house_no, username, phone_no, password, role, status)
                VALUES (?, ?, ?, ?, 'resident', 'pending')
            `;

            db.query(
                insertSql,
                [
                    house_no,
                    username,
                    phone_no,
                    password
                ],
                (err, result) => {

                    if (err) {
                        console.error("Insert error:", err);

                        return res.status(500).json({
                            message: "Unable to submit registration request."
                        });
                    }

                    res.status(201).json({
                        message: "Registration request submitted successfully.",
                        userId: result.insertId
                    });

                }
            );
        }
    );
});