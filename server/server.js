// ==========================================
// TownCare - Backend Server
// ==========================================

const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const db = require("./db");
const fs = require("fs");

const app = express();

const PORT = 3000;

// ==========================================
// Middleware
// ==========================================

app.use(cors());

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ==========================================
// Multer - Complaint Photo Upload
// ==========================================

const complaintStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/complaints"));
  },

  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();

    const fileName = `complaint-${Date.now()}${extension}`;

    cb(null, fileName);
  },
});

const uploadComplaintPhoto = multer({
  storage: complaintStorage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG and WEBP images are allowed."));
    }
  },
});

// ==========================================
// Multer - Lost & Found Photo Upload
// ==========================================

const lostFoundStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/lost-found"));
  },

  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();

    const fileName = `lost-found-${Date.now()}${extension}`;

    cb(null, fileName);
  },
});

const uploadLostFoundPhoto = multer({
  storage: lostFoundStorage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG and WEBP images are allowed."));
    }
  },
});

// ==========================================
// Multer - Notice Attachment Upload
// ==========================================

const noticeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/notices"));
  },

  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();

    const fileName = `notice-${Date.now()}${extension}`;

    cb(null, fileName);
  },
});

const uploadNoticeAttachment = multer({
  storage: noticeStorage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, PNG and WEBP files are allowed."));
    }
  },
});

// ==========================================
// Delete Uploaded File
// ==========================================

function deleteUploadedFile(filePath) {
  if (!filePath) {
    return;
  }

  const cleanPath = filePath.replace(/^\/+/, "");

  const fullPath = path.join(__dirname, "..", cleanPath);

  fs.unlink(fullPath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Unable to delete uploaded file:", err.message);
    }
  });
}

// ==========================================
// Test Route
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "TownCare server is running.",
  });
});

// ==========================================
// Resident Login
// ==========================================

app.post("/api/auth/login", (req, res) => {
  const { house_no, phone_no, password } = req.body;

  // --------------------------------------
  // Validate Input
  // --------------------------------------

  if (!house_no || !phone_no || !password) {
    return res.status(400).json({
      message: "All fields are required.",
    });
  }

  // --------------------------------------
  // Find User
  // --------------------------------------

  const sql = `
        SELECT
            id,
            house_no,
            username,
            phone_no,
            role,
            status
        FROM users
        WHERE house_no = ?
        AND phone_no = ?
        AND password = ?
    `;

  db.query(sql, [house_no, phone_no, password], (err, results) => {
    if (err) {
      console.error("Database error:", err);

      return res.status(500).json({
        message: "Database error.",
      });
    }

    // ----------------------------------
    // User Not Found
    // ----------------------------------

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid house number, mobile number or password.",
      });
    }

    const user = results[0];

    // ----------------------------------
    // Check Account Status
    // ----------------------------------

    if (user.status !== "approved") {
      if (user.status === "pending") {
        return res.status(403).json({
          message: "Your registration is still pending admin approval.",
        });
      }

      if (user.status === "rejected") {
        return res.status(403).json({
          message: "Your registration request has been rejected.",
        });
      }

      return res.status(403).json({
        message: "Your account is not approved.",
      });
    }

    // ----------------------------------
    // Login Successful
    // ----------------------------------

    res.status(200).json({
      message: "Login successful.",

      user: {
        id: user.id,

        house_no: user.house_no,

        username: user.username,

        phone_no: user.phone_no,

        role: user.role,

        status: user.status,
      },
    });
  });
});

// ==========================================
// Admin Login
// ==========================================

app.post("/api/admin/login", (req, res) => {
  const { phone_no, password } = req.body;

  // --------------------------------------
  // Validate Input
  // --------------------------------------

  if (!phone_no || !password) {
    return res.status(400).json({
      message: "Mobile number and password are required.",
    });
  }

  // --------------------------------------
  // Find Admin
  // --------------------------------------

  const sql = `
        SELECT
            id,
            house_no,
            username,
            phone_no,
            role,
            status
        FROM users
        WHERE phone_no = ?
        AND password = ?
        AND role = 'admin'
    `;

  db.query(sql, [phone_no, password], (err, results) => {
    if (err) {
      console.error("Admin login database error:", err);

      return res.status(500).json({
        message: "Database error.",
      });
    }

    // ----------------------------------
    // Admin Not Found
    // ----------------------------------

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid mobile number or password.",
      });
    }

    const admin = results[0];

    // ----------------------------------
    // Check Admin Status
    // ----------------------------------

    if (admin.status !== "approved") {
      if (admin.status === "pending") {
        return res.status(403).json({
          message: "This admin account is still pending approval.",
        });
      }

      if (admin.status === "rejected") {
        return res.status(403).json({
          message: "This admin account has been rejected.",
        });
      }

      return res.status(403).json({
        message: "This admin account is not approved.",
      });
    }

    // ----------------------------------
    // Admin Login Successful
    // ----------------------------------

    res.status(200).json({
      message: "Admin login successful.",

      user: {
        id: admin.id,

        house_no: admin.house_no,

        username: admin.username,

        phone_no: admin.phone_no,

        role: admin.role,

        status: admin.status,
      },
    });
  });
});

// ==========================================
// Registration
// ==========================================

app.post("/api/auth/register", (req, res) => {
  const { house_no, username, phone_no, password } = req.body;

  // --------------------------------------
  // Validate Input
  // --------------------------------------

  if (!house_no || !username || !phone_no || !password) {
    return res.status(400).json({
      message: "All fields are required.",
    });
  }

  // --------------------------------------
  // Check Duplicate House / Phone
  // --------------------------------------

  const checkSql = `
        SELECT
            id
        FROM users
        WHERE house_no = ?
        OR phone_no = ?
    `;

  db.query(checkSql, [house_no, phone_no], (err, results) => {
    if (err) {
      console.error("Database error:", err);

      return res.status(500).json({
        message: "Database error.",
      });
    }

    if (results.length > 0) {
      return res.status(409).json({
        message: "House number or mobile number is already registered.",
      });
    }

    // ----------------------------------
    // Insert Registration Request
    // ----------------------------------

    const insertSql = `
                INSERT INTO users
                (
                    house_no,
                    username,
                    phone_no,
                    password,
                    role,
                    status
                )
                VALUES (
                    ?,
                    ?,
                    ?,
                    ?,
                    'resident',
                    'pending'
                )
            `;

    db.query(
      insertSql,
      [house_no, username, phone_no, password],
      (err, result) => {
        if (err) {
          console.error("Insert error:", err);

          return res.status(500).json({
            message: "Unable to submit registration request.",
          });
        }

        res.status(201).json({
          message: "Registration request submitted successfully.",

          userId: result.insertId,
        });
      },
    );
  });
});

// ==========================================
// Admin Dashboard
// ==========================================

app.get("/api/admin/dashboard", async (req, res) => {
  try {
    // ----------------------------------
    // Total Approved Residents
    // ----------------------------------

    const totalResidentsSql = `
                SELECT
                    COUNT(*) AS totalResidents
                FROM users
                WHERE role = 'resident'
                AND status = 'approved'
            `;

    // ----------------------------------
    // Pending Registrations
    // ----------------------------------

    const pendingRegistrationsSql = `
                SELECT
                    COUNT(*) AS pendingRegistrations
                FROM users
                WHERE role = 'resident'
                AND status = 'pending'
            `;

    // ----------------------------------
    // Active Complaints
    // ----------------------------------

    const activeComplaintsSql = `
                SELECT
                    COUNT(*) AS activeComplaints
                FROM complaints
                WHERE status IN (
                    'Pending',
                    'Assigned',
                    'In Progress'
                )
            `;

    // ----------------------------------
    // Pending Bills
    // ----------------------------------

    const pendingBillsSql = `
                SELECT
                    COUNT(*) AS pendingBills
                FROM bills
                WHERE status = 'Pending'
            `;

    // ----------------------------------
    // Recent Complaints
    // ----------------------------------

    const recentComplaintsSql = `
                SELECT
                    c.id,
                    c.user_id,
                    c.category,
                    c.location,
                    c.description,
                    c.photo,
                    c.provider_name,
                    c.provider_phone,
                    c.status,
                    c.created_at,
                    u.username,
                    u.house_no
                FROM complaints c
                INNER JOIN users u
                    ON c.user_id = u.id
                ORDER BY c.id DESC
                LIMIT 5
            `;

    // ----------------------------------
    // Pending Residents
    // ----------------------------------

    const pendingResidentsSql = `
                SELECT
                    id,
                    house_no,
                    username,
                    phone_no,
                    role,
                    status,
                    created_at
                FROM users
                WHERE role = 'resident'
                AND status = 'pending'
                ORDER BY id DESC
                LIMIT 5
            `;

    // ----------------------------------
    // Recent Bills
    // ----------------------------------

    const recentBillsSql = `
                SELECT
                    b.id,
                    b.user_id,
                    b.bill_type,
                    b.month,
                    b.year,
                    b.amount,
                    b.due_date,
                    b.payment_date,
                    b.status,
                    b.created_at,
                    u.username,
                    u.house_no
                FROM bills b
                INNER JOIN users u
                    ON b.user_id = u.id
                ORDER BY b.id DESC
                LIMIT 5
            `;

    // ----------------------------------
    // Latest Notices
    // ----------------------------------

    const latestNoticesSql = `
SELECT
    n.id,
    n.title,
    n.category,
    n.description,
    n.attachment,
    n.published_by,
    n.created_at,
    u.username AS publisher_name
FROM notices n
INNER JOIN users u
    ON n.published_by = u.id
ORDER BY n.id DESC
            `;

    // ----------------------------------
    // Execute Queries
    // ----------------------------------

    const [
      totalResidentsResult,
      pendingRegistrationsResult,
      activeComplaintsResult,
      pendingBillsResult,
      recentComplaintsResult,
      pendingResidentsResult,
      recentBillsResult,
      latestNoticesResult,
    ] = await Promise.all([
      queryDatabase(totalResidentsSql),

      queryDatabase(pendingRegistrationsSql),

      queryDatabase(activeComplaintsSql),

      queryDatabase(pendingBillsSql),

      queryDatabase(recentComplaintsSql),

      queryDatabase(pendingResidentsSql),

      queryDatabase(recentBillsSql),

      queryDatabase(latestNoticesSql),
    ]);

    // ----------------------------------
    // Dashboard Response
    // ----------------------------------

    res.status(200).json({
      stats: {
        totalResidents: totalResidentsResult[0]?.totalResidents || 0,

        pendingRegistrations:
          pendingRegistrationsResult[0]?.pendingRegistrations || 0,

        activeComplaints: activeComplaintsResult[0]?.activeComplaints || 0,

        pendingBills: pendingBillsResult[0]?.pendingBills || 0,
      },

      recentComplaints: recentComplaintsResult,

      pendingResidents: pendingResidentsResult,

      recentBills: recentBillsResult,

      latestNotices: latestNoticesResult,
    });
  } catch (error) {
    console.error("Admin dashboard database error:", error);

    res.status(500).json({
      message: "Unable to load admin dashboard data.",
    });
  }
});

// ==========================================
// Database Query Helper
// ==========================================

function queryDatabase(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);

        return;
      }

      resolve(results);
    });
  });
}

// ==========================================
// Admin - Get Residents
// ==========================================

app.get("/api/admin/residents", (req, res) => {
  const sql = `
            SELECT
                id,
                house_no,
                username,
                phone_no,
                role,
                status,
                created_at
            FROM users
            WHERE role = 'resident'
            ORDER BY id DESC
        `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Admin residents database error:", err);

      return res.status(500).json({
        message: "Unable to retrieve residents.",
      });
    }

    res.status(200).json({
      residents: results,
    });
  });
});

// ==========================================
// Admin - Update Resident Status
// ==========================================

app.put("/api/admin/residents/:id/status", (req, res) => {
  const residentId = req.params.id;

  const { status } = req.body;

  // ----------------------------------
  // Validate Resident ID
  // ----------------------------------

  if (!residentId || isNaN(residentId)) {
    return res.status(400).json({
      message: "Invalid resident ID.",
    });
  }

  // ----------------------------------
  // Validate Status
  // ----------------------------------

  if (status !== "approved" && status !== "rejected" && status !== "pending") {
    return res.status(400).json({
      message: "Invalid resident status.",
    });
  }

  // ----------------------------------
  // Update Resident
  // ----------------------------------

  const sql = `
            UPDATE users
            SET status = ?
            WHERE id = ?
            AND role = 'resident'
        `;

  db.query(sql, [status, residentId], (err, result) => {
    if (err) {
      console.error("Resident status update error:", err);

      return res.status(500).json({
        message: "Unable to update resident status.",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Resident not found.",
      });
    }

    let message = "Resident status updated successfully.";

    if (status === "approved") {
      message = "Resident account approved successfully.";
    }

    if (status === "rejected") {
      message = "Resident account rejected successfully.";
    }

    res.status(200).json({
      message: message,
    });
  });
});

// ==========================================
// Get Complaints of Logged-in Resident
// ==========================================

app.get("/api/complaints/:userId", (req, res) => {
  const userId = req.params.userId;

  // ----------------------------------
  // Validate User ID
  // ----------------------------------

  if (!userId || isNaN(userId)) {
    return res.status(400).json({
      message: "Invalid user ID.",
    });
  }

  const sql = `
            SELECT
                id,
                user_id,
                category,
                location,
                description,
                photo,
                provider_name,
                provider_phone,
                status,
                created_at
            FROM complaints
            WHERE user_id = ?
            ORDER BY id DESC
        `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Complaints database error:", err);

      return res.status(500).json({
        message: "Unable to retrieve complaints.",
      });
    }

    res.status(200).json({
      complaints: results,
    });
  });
});

// ==========================================
// Create New Complaint
// ==========================================

app.post(
  "/api/complaints",
  uploadComplaintPhoto.single("photo"),
  (req, res) => {
    const { user_id, category, location, description } = req.body;

    const photo = req.file ? `/uploads/complaints/${req.file.filename}` : null;

    // ----------------------------------
    // Validate Required Fields
    // ----------------------------------

    if (!user_id || !category || !location || !description) {
      return res.status(400).json({
        message: "User ID, category, location and description are required.",
      });
    }

    // ----------------------------------
    // Verify User
    // ----------------------------------

    const userCheckSql = `
            SELECT
                id
            FROM users
            WHERE id = ?
        `;

    db.query(userCheckSql, [user_id], (err, userResults) => {
      if (err) {
        console.error("User verification error:", err);

        return res.status(500).json({
          message: "Database error.",
        });
      }

      if (userResults.length === 0) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      // ------------------------------
      // Insert Complaint
      // ------------------------------

      const insertSql = `
                    INSERT INTO complaints
                    (
                        user_id,
                        category,
                        location,
                        description,
                        photo,
                        status
                    )
                    VALUES (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        'Pending'
                    )
                `;

      db.query(
        insertSql,
        [user_id, category, location, description, photo || null],
        (err, result) => {
          if (err) {
            console.error("Complaint insert error:", err);

            return res.status(500).json({
              message: "Unable to submit complaint.",
            });
          }

          res.status(201).json({
            message: "Complaint submitted successfully.",

            complaintId: result.insertId,
          });
        },
      );
    });
  },
);

// ==========================================
// Admin - Get All Complaints
// ==========================================

app.get("/api/admin/complaints", (req, res) => {
  const sql = `
            SELECT
                c.id,
                c.user_id,
                c.category,
                c.location,
                c.description,
                c.photo,
                c.provider_name,
                c.provider_phone,
                c.status,
                c.created_at,
                u.username,
                u.house_no,
                u.phone_no
            FROM complaints c
            INNER JOIN users u
                ON c.user_id = u.id
            ORDER BY c.id DESC
        `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Admin complaints database error:", err);

      return res.status(500).json({
        message: "Unable to retrieve complaints.",
      });
    }

    res.status(200).json({
      complaints: results,
    });
  });
});

// ==========================================
// Admin - Update Complaint
// ==========================================

app.put("/api/admin/complaints/:id", (req, res) => {
  const complaintId = req.params.id;

  const { provider_name, provider_phone, status } = req.body;

  // ----------------------------------
  // Validate Complaint ID
  // ----------------------------------

  if (!complaintId || isNaN(complaintId)) {
    return res.status(400).json({
      message: "Invalid complaint ID.",
    });
  }

  // ----------------------------------
  // Validate Status
  // ----------------------------------

  const validStatuses = ["Pending", "Assigned", "In Progress", "Resolved"];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid complaint status.",
    });
  }

  // ----------------------------------
  // Update Complaint
  // ----------------------------------

  const sql = `
            UPDATE complaints
            SET
                provider_name = ?,
                provider_phone = ?,
                status = ?
            WHERE id = ?
        `;

  db.query(
    sql,
    [
      provider_name || null,
      provider_phone || null,
      status || "Pending",
      complaintId,
    ],
    (err, result) => {
      if (err) {
        console.error("Complaint update error:", err);

        return res.status(500).json({
          message: "Unable to update complaint.",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Complaint not found.",
        });
      }

      res.status(200).json({
        message: "Complaint updated successfully.",
      });
    },
  );
});

// ==========================================
// Get Visitors of Logged-in Resident
// ==========================================

app.get("/api/visitors/:userId", (req, res) => {
  const userId = req.params.userId;

  // ----------------------------------
  // Validate User ID
  // ----------------------------------

  if (!userId || isNaN(userId)) {
    return res.status(400).json({
      message: "Invalid user ID.",
    });
  }

  const sql = `
            SELECT
                id,
                user_id,
                visitor_name,
                mobile,
                vehicle,
                visit_date,
                expected_time,
                purpose,
                valid_till,
                otp,
                status,
                created_at
            FROM visitors
            WHERE user_id = ?
            ORDER BY id DESC
        `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Visitors database error:", err);

      return res.status(500).json({
        message: "Unable to retrieve visitors.",
      });
    }

    res.status(200).json({
      visitors: results,
    });
  });
});

// ==========================================
// Create New Visitor Invitation
// ==========================================

app.post("/api/visitors", (req, res) => {
  const {
    user_id,
    visitor_name,
    mobile,
    vehicle,
    visit_date,
    expected_time,
    purpose,
    valid_till,
    otp,
  } = req.body;

  // ----------------------------------
  // Validate Required Fields
  // ----------------------------------

  if (
    !user_id ||
    !visitor_name ||
    !mobile ||
    !visit_date ||
    !expected_time ||
    !purpose ||
    !valid_till ||
    !otp
  ) {
    return res.status(400).json({
      message:
        "User ID, visitor name, mobile, visit date, expected time, purpose, valid till and OTP are required.",
    });
  }

  // ----------------------------------
  // Validate OTP
  // ----------------------------------

  if (!/^[0-9]{6}$/.test(otp)) {
    return res.status(400).json({
      message: "OTP must be a 6-digit number.",
    });
  }

  // ----------------------------------
  // Verify User
  // ----------------------------------

  const userCheckSql = `
            SELECT
                id
            FROM users
            WHERE id = ?
        `;

  db.query(userCheckSql, [user_id], (err, userResults) => {
    if (err) {
      console.error("User verification error:", err);

      return res.status(500).json({
        message: "Database error.",
      });
    }

    if (userResults.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // ------------------------------
    // Insert Visitor
    // ------------------------------

    const insertSql = `
                    INSERT INTO visitors
                    (
                        user_id,
                        visitor_name,
                        mobile,
                        vehicle,
                        visit_date,
                        expected_time,
                        purpose,
                        valid_till,
                        otp,
                        status
                    )
                    VALUES (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        'upcoming'
                    )
                `;

    db.query(
      insertSql,
      [
        user_id,
        visitor_name,
        mobile,
        vehicle || null,
        visit_date,
        expected_time,
        purpose,
        valid_till,
        otp,
      ],
      (err, result) => {
        if (err) {
          console.error("Visitor insert error:", err);

          return res.status(500).json({
            message: "Unable to create visitor invitation.",
          });
        }

        res.status(201).json({
          message: "Visitor invitation created successfully.",

          visitorId: result.insertId,
        });
      },
    );
  });
});

// ==========================================
// Admin - Get All Visitors
// ==========================================

app.get("/api/admin/visitors", (req, res) => {
  const sql = `
        SELECT
            v.id,
            v.user_id,
            v.visitor_name,
            v.mobile,
            v.vehicle,
            v.visit_date,
            v.expected_time,
            v.purpose,
            v.valid_till,
            v.otp,
            v.status,
            v.created_at,
            u.username,
            u.house_no,
            u.phone_no
        FROM visitors v
        INNER JOIN users u
            ON v.user_id = u.id
        ORDER BY v.id DESC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Admin visitors database error:", err);

      return res.status(500).json({
        message: "Unable to retrieve visitors.",
      });
    }

    res.status(200).json({
      visitors: results,
    });
  });
});

// ==========================================
// Admin - Update Visitor Status
// ==========================================

app.put("/api/admin/visitors/:id/status", (req, res) => {
  const visitorId = req.params.id;
  const { status } = req.body;

  // ----------------------------------
  // Validate Visitor ID
  // ----------------------------------

  if (!visitorId || isNaN(visitorId)) {
    return res.status(400).json({
      message: "Invalid visitor ID.",
    });
  }

  // ----------------------------------
  // Validate Status
  // ----------------------------------

  if (status !== "inside" && status !== "completed") {
    return res.status(400).json({
      message: "Invalid visitor status.",
    });
  }

  // ----------------------------------
  // Update Visitor
  // ----------------------------------

  const sql = `
        UPDATE visitors
        SET status = ?
        WHERE id = ?
    `;

  db.query(sql, [status, visitorId], (err, result) => {
    if (err) {
      console.error("Visitor status update error:", err);

      return res.status(500).json({
        message: "Unable to update visitor status.",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Visitor not found.",
      });
    }

    res.status(200).json({
      message: "Visitor status updated successfully.",
    });
  });
});

// ==========================================
// Get Lost & Found Records
// ==========================================

app.get("/api/lost-found", (req, res) => {
  const sql = `
            SELECT
                lf.id,
                lf.user_id,
                lf.type,
                lf.item_name,
                lf.location,
                lf.item_date,
                lf.description,
                lf.photo,
                lf.created_at,
                u.username,
                u.house_no
            FROM lost_found lf
            INNER JOIN users u
                ON lf.user_id = u.id
            ORDER BY lf.id DESC
        `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Lost & Found database error:", err);

      return res.status(500).json({
        message: "Unable to retrieve Lost & Found records.",
      });
    }

    res.status(200).json({
      items: results,
    });
  });
});

// ==========================================
// Create Lost & Found Record
// ==========================================

app.post(
  "/api/lost-found",
  uploadLostFoundPhoto.single("photo"),
  (req, res) => {
    const { user_id, type, item_name, location, item_date, description } =
      req.body;

    const photo = req.file ? `/uploads/lost-found/${req.file.filename}` : null;

    // ----------------------------------
    // Validate Required Fields
    // ----------------------------------

    if (
      !user_id ||
      !type ||
      !item_name ||
      !location ||
      !item_date ||
      !description
    ) {
      return res.status(400).json({
        message:
          "User ID, type, item name, location, date and description are required.",
      });
    }

    // ----------------------------------
    // Validate Type
    // ----------------------------------

    if (type !== "Lost" && type !== "Found") {
      return res.status(400).json({
        message: "Item type must be Lost or Found.",
      });
    }

    // ----------------------------------
    // Verify User
    // ----------------------------------

    const userCheckSql = `
            SELECT
                id
            FROM users
            WHERE id = ?
        `;

    db.query(userCheckSql, [user_id], (err, userResults) => {
      if (err) {
        console.error("User verification error:", err);

        return res.status(500).json({
          message: "Database error.",
        });
      }

      if (userResults.length === 0) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      // ------------------------------
      // Insert Record
      // ------------------------------

      const insertSql = `
                    INSERT INTO lost_found
                    (
                        user_id,
                        type,
                        item_name,
                        location,
                        item_date,
                        description,
                        photo
                    )
                    VALUES (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?
                    )
                `;

      db.query(
        insertSql,
        [
          user_id,
          type,
          item_name,
          location,
          item_date,
          description,
          photo || null,
        ],
        (err, result) => {
          if (err) {
            console.error("Lost & Found insert error:", err);

            return res.status(500).json({
              message: "Unable to submit Lost & Found record.",
            });
          }

          res.status(201).json({
            message: "Lost & Found record submitted successfully.",

            itemId: result.insertId,
          });
        },
      );
    });
  },
);

// ==========================================
// Get Bills of Logged-in Resident
// ==========================================

app.get("/api/bills/:userId", (req, res) => {
  const userId = req.params.userId;

  // ----------------------------------
  // Validate User ID
  // ----------------------------------

  if (!userId || isNaN(userId)) {
    return res.status(400).json({
      message: "Invalid user ID.",
    });
  }

  const sql = `
            SELECT
                id,
                user_id,
                bill_type,
                month,
                year,
                amount,
                due_date,
                payment_date,
                status,
                created_at
            FROM bills
            WHERE user_id = ?
            ORDER BY year DESC, id DESC
        `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Bills database error:", err);

      return res.status(500).json({
        message: "Unable to retrieve bills.",
      });
    }

    res.status(200).json({
      bills: results,
    });
  });
});

// ==========================================
// Admin - Get All Bills
// ==========================================

app.get("/api/admin/bills", (req, res) => {
  const sql = `
            SELECT
                b.id,
                b.user_id,
                b.bill_type,
                b.month,
                b.year,
                b.amount,
                b.due_date,
                b.payment_date,
                b.status,
                b.created_at,
                u.username,
                u.house_no,
                u.phone_no
            FROM bills b
            INNER JOIN users u
                ON b.user_id = u.id
            ORDER BY
                b.year DESC,
                b.id DESC
        `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Admin bills database error:", err);

      return res.status(500).json({
        message: "Unable to retrieve bills.",
      });
    }

    res.status(200).json({
      bills: results,
    });
  });
});

// ==========================================
// Admin - Create Bill
// ==========================================

app.post("/api/admin/bills", (req, res) => {
  const { user_id, bill_type, month, year, amount, due_date } = req.body;

  // ----------------------------------
  // Validate Required Fields
  // ----------------------------------

  if (
    !user_id ||
    !bill_type ||
    !month ||
    !year ||
    amount === undefined ||
    amount === null ||
    !due_date
  ) {
    return res.status(400).json({
      message:
        "User ID, bill type, month, year, amount and due date are required.",
    });
  }

  // ----------------------------------
  // Validate Amount
  // ----------------------------------

  if (isNaN(amount) || Number(amount) < 0) {
    return res.status(400).json({
      message: "Amount must be a valid non-negative number.",
    });
  }

  // ----------------------------------
  // Verify Resident
  // ----------------------------------

  const userCheckSql = `
            SELECT
                id
            FROM users
            WHERE id = ?
            AND role = 'resident'
        `;

  db.query(userCheckSql, [user_id], (err, userResults) => {
    if (err) {
      console.error("Bill user verification error:", err);

      return res.status(500).json({
        message: "Database error.",
      });
    }

    if (userResults.length === 0) {
      return res.status(404).json({
        message: "Resident not found.",
      });
    }

    // ------------------------------
    // Insert Bill
    // ------------------------------

    const insertSql = `
                    INSERT INTO bills
                    (
                        user_id,
                        bill_type,
                        month,
                        year,
                        amount,
                        due_date,
                        status
                    )
                    VALUES (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        'Pending'
                    )
                `;

    db.query(
      insertSql,
      [user_id, bill_type, month, year, amount, due_date],
      (err, result) => {
        if (err) {
          console.error("Bill insert error:", err);

          return res.status(500).json({
            message: "Unable to create bill.",
          });
        }

        res.status(201).json({
          message: "Bill created successfully.",

          billId: result.insertId,
        });
      },
    );
  });
});

// ==========================================
// Admin - Update Bill Status
// ==========================================

app.put("/api/admin/bills/:id/status", (req, res) => {
  const billId = req.params.id;

  const { status } = req.body;

  // ----------------------------------
  // Validate Bill ID
  // ----------------------------------

  if (!billId || isNaN(billId)) {
    return res.status(400).json({
      message: "Invalid bill ID.",
    });
  }

  // ----------------------------------
  // Validate Status
  // ----------------------------------

  if (status !== "Pending" && status !== "Paid") {
    return res.status(400).json({
      message: "Bill status must be Pending or Paid.",
    });
  }

  // ----------------------------------
  // Update Status
  // ----------------------------------

  const sql = `
            UPDATE bills
            SET
                status = ?,
                payment_date = ?
            WHERE id = ?
        `;

  const paymentDate = status === "Paid" ? new Date() : null;

  db.query(sql, [status, paymentDate, billId], (err, result) => {
    if (err) {
      console.error("Bill status update error:", err);

      return res.status(500).json({
        message: "Unable to update bill status.",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Bill not found.",
      });
    }

    res.status(200).json({
      message: "Bill status updated successfully.",
    });
  });
});

// ==========================================
// Get Notices
// ==========================================

app.get("/api/notices", (req, res) => {
  const sql = `
    SELECT
        n.id,
        n.title,
        n.category,
        n.description,
        n.attachment,
        n.published_by,
        n.created_at,
        u.username AS publisher_name
    FROM notices n
    INNER JOIN users u
        ON n.published_by = u.id
    ORDER BY n.id DESC
`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Notices database error:", err);

      return res.status(500).json({
        message: "Unable to retrieve notices.",
      });
    }

    res.status(200).json({
      notices: results,
    });
  });
});

// ==========================================
// Admin - Create Notice
// ==========================================

// ==========================================
// Admin - Create Notice
// ==========================================

app.post(
  "/api/admin/notices",
  uploadNoticeAttachment.single("attachment"),
  (req, res) => {
    const { title, category, description, published_by } = req.body;

    const attachment = req.file
      ? `/uploads/notices/${req.file.filename}`
      : null;

    // ----------------------------------
    // Validate Required Fields
    // ----------------------------------

    if (!title || !category || !description || !published_by) {
      if (req.file) {
        deleteUploadedFile(attachment);
      }

      return res.status(400).json({
        message: "Title, category, description and publisher are required.",
      });
    }

    // ----------------------------------
    // Validate Publisher
    // ----------------------------------

    const publisherCheckSql = `
            SELECT
                id
            FROM users
            WHERE id = ?
            AND role = 'admin'
            AND status = 'approved'
        `;

    db.query(publisherCheckSql, [published_by], (err, publisherResults) => {
      if (err) {
        if (req.file) {
          deleteUploadedFile(attachment);
        }

        console.error("Notice publisher verification error:", err);

        return res.status(500).json({
          message: "Database error.",
        });
      }

      if (publisherResults.length === 0) {
        if (req.file) {
          deleteUploadedFile(attachment);
        }

        return res.status(403).json({
          message: "Invalid or unauthorized admin.",
        });
      }

      // ------------------------------
      // Insert Notice
      // ------------------------------

      const insertSql = `
                    INSERT INTO notices
                    (
                        title,
                        category,
                        description,
                        attachment,
                        published_by
                    )
                    VALUES (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?
                    )
                `;

      db.query(
        insertSql,
        [title, category, description, attachment, published_by],
        (err, result) => {
          if (err) {
            if (req.file) {
              deleteUploadedFile(attachment);
            }

            console.error("Notice insert error:", err);

            return res.status(500).json({
              message: "Unable to create notice.",
            });
          }

          res.status(201).json({
            message: "Notice published successfully.",

            noticeId: result.insertId,
          });
        },
      );
    });
  },
);

// ==========================================
// Admin - Update Notice
// ==========================================

// ==========================================
// Admin - Update Notice
// ==========================================

app.put(
  "/api/admin/notices/:id",
  uploadNoticeAttachment.single("attachment"),
  (req, res) => {
    const noticeId = req.params.id;

    const { title, category, description } = req.body;

    const newAttachment = req.file
      ? `/uploads/notices/${req.file.filename}`
      : null;

    // ----------------------------------
    // Validate Notice ID
    // ----------------------------------

    if (!noticeId || isNaN(noticeId)) {
      if (req.file) {
        deleteUploadedFile(newAttachment);
      }

      return res.status(400).json({
        message: "Invalid notice ID.",
      });
    }

    // ----------------------------------
    // Validate Fields
    // ----------------------------------

    if (!title || !category || !description) {
      if (req.file) {
        deleteUploadedFile(newAttachment);
      }

      return res.status(400).json({
        message: "Title, category and description are required.",
      });
    }

    // ----------------------------------
    // Get Existing Attachment
    // ----------------------------------

    const getNoticeSql = `
            SELECT
                attachment
            FROM notices
            WHERE id = ?
        `;

    db.query(getNoticeSql, [noticeId], (err, noticeResults) => {
      if (err) {
        if (req.file) {
          deleteUploadedFile(newAttachment);
        }

        console.error("Notice lookup error:", err);

        return res.status(500).json({
          message: "Database error.",
        });
      }

      if (noticeResults.length === 0) {
        if (req.file) {
          deleteUploadedFile(newAttachment);
        }

        return res.status(404).json({
          message: "Notice not found.",
        });
      }

      const oldAttachment = noticeResults[0].attachment;

      // ----------------------------------
      // Update Notice
      // ----------------------------------

      const updateSql = newAttachment
        ? `
                            UPDATE notices
                            SET
                                title = ?,
                                category = ?,
                                description = ?,
                                attachment = ?
                            WHERE id = ?
                        `
        : `
                            UPDATE notices
                            SET
                                title = ?,
                                category = ?,
                                description = ?
                            WHERE id = ?
                        `;

      const updateParams = newAttachment
        ? [title, category, description, newAttachment, noticeId]
        : [title, category, description, noticeId];

      db.query(updateSql, updateParams, (err, result) => {
        if (err) {
          if (req.file) {
            deleteUploadedFile(newAttachment);
          }

          console.error("Notice update error:", err);

          return res.status(500).json({
            message: "Unable to update notice.",
          });
        }

        // ----------------------------------
        // Delete Old Attachment
        // ----------------------------------

        if (newAttachment && oldAttachment) {
          deleteUploadedFile(oldAttachment);
        }

        res.status(200).json({
          message: "Notice updated successfully.",
        });
      });
    });
  },
);

// ==========================================
// Admin - Delete Notice
// ==========================================

// ==========================================
// Admin - Delete Notice
// ==========================================

app.delete("/api/admin/notices/:id", (req, res) => {
  const noticeId = req.params.id;

  // ----------------------------------
  // Validate Notice ID
  // ----------------------------------

  if (!noticeId || isNaN(noticeId)) {
    return res.status(400).json({
      message: "Invalid notice ID.",
    });
  }

  // ----------------------------------
  // Get Attachment
  // ----------------------------------

  const getNoticeSql = `
            SELECT
                attachment
            FROM notices
            WHERE id = ?
        `;

  db.query(getNoticeSql, [noticeId], (err, noticeResults) => {
    if (err) {
      console.error("Notice lookup error:", err);

      return res.status(500).json({
        message: "Database error.",
      });
    }

    if (noticeResults.length === 0) {
      return res.status(404).json({
        message: "Notice not found.",
      });
    }

    const attachment = noticeResults[0].attachment;

    // ----------------------------------
    // Delete Notice
    // ----------------------------------

    const deleteSql = `
                    DELETE FROM notices
                    WHERE id = ?
                `;

    db.query(deleteSql, [noticeId], (err, result) => {
      if (err) {
        console.error("Notice delete error:", err);

        return res.status(500).json({
          message: "Unable to delete notice.",
        });
      }

      // ----------------------------------
      // Delete Attachment File
      // ----------------------------------

      if (attachment) {
        deleteUploadedFile(attachment);
      }

      res.status(200).json({
        message: "Notice deleted successfully.",
      });
    });
  });
});

// ==========================================
// Start Server
// ==========================================

app.listen(PORT, () => {
  console.log(`TownCare server running at http://localhost:${PORT}`);
});
