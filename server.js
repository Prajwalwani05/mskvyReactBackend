const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bcrypt = require('bcryptjs');
require("dotenv").config(); 
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 5000; // Backend port
// const DOTNET_API_URL = "http://localhost:56602"; // .NET Core API
const DOTNET_API_URL = "http://10.131.30.31:81"; // .NET Core API

app.use(
  cors({
    origin: "*", // Allow frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.post("/api/login", async (req, res) => {
  try {
    console.log("Received Request:", req.body); // ✅ Log request data
    const { LOGIN_ID, PASSWORD, UserType, action, OTP } = req.body;

    if (!LOGIN_ID || !UserType || !action) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ Status: "Missing required fields" });
    }

    let requestData = { LOGIN_ID, UserType, PASSWORD: PASSWORD || "", OTP: OTP || "" };
    console.log("Sending Request to .NET API:", requestData); // ✅ Log request before calling API

    const response = await axios.post(`${DOTNET_API_URL}/api/Login?action=${action}`, requestData, {
      headers: { "Content-Type": "application/json" },
    });

    const token = jwt.sign(
      { LOGIN_ID }, 
      process.env.JWT_SECRET || '9096609945', 
      { expiresIn: '1h' }
    );

    return res.status(response.status).json({
      Status: response.data.Status,
      Message: response.data.Message,
      RedirectTo: response.data.RedirectTo,
      Model: response.data.Model || null,
      SessionData: response.data.SessionData || null,
      Token: token
    });
    
  } catch (error) {
    console.error("❌ Error in Node.js API:", error.message);
    return res.status(500).json({ Status: "Server error", Error: error.message });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    console.log("Received Request:", req.body); // ✅ Log request data

    const { LOGIN_ID, EMAIL_ID } = req.body;

    if (!LOGIN_ID || !EMAIL_ID) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ Status: "Missing required fields" });
    }

    let requestData = { LOGIN_ID, EMAIL_ID };
    console.log("Sending Request to .NET API:", requestData); // ✅ Log request before calling API

    const response = await axios.post(`${DOTNET_API_URL}/api/auth/forgot-password`, 
    {
      LOGIN_ID: LOGIN_ID,
      EMAIL_ID: EMAIL_ID
    },
    {
      headers: { "Content-Type": "application/json" },
    });
    res.json(response.data)
    
  } catch (error) {
    console.error("❌ Error in Node.js API:", error.message);
    return res.status(500).json({ Status: "Server error", Error: error.message });
  }
});

app.post("/api/UpdatePassword", async (req, res) => {
  try {
    console.log("Received Request:", req.body); // ✅ Log request data

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ Status: "Missing required fields" });
    }

    const response = await axios.post(`${DOTNET_API_URL}/api/UpdatePassword`, 
    {
      oldPassword: oldPassword,
      NewPassword: newPassword,
    },
    {
      headers: { "Content-Type": "application/json" },
    });
    res.json(response.data)
    
  } catch (error) {
    console.error("❌ Error in Node.js API:", error.message);
    return res.status(500).json({ Status: "Server error", Error: error.message });
  }
});

app.get("/api/UserProfile", async (req, res) => {
  try {
    const { LoginID } = req.query;
    console.log("Sending Request to .NET API:", LoginID); // ✅ Log request before calling API
    const response = await axios.get(`${DOTNET_API_URL}/api/UserProfile`, {
      params: { LoginId: LoginID },  // ✅ Params should be inside this object
      headers: { "Content-Type": "application/json" },
    });
    
    console.log(response.data)
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get("/api/GetAllDistrictSummary", async (req, res) => {
  try {
    const response = await axios.get(
      `${DOTNET_API_URL}/api/DistrictWiseSummary/GetAllDistrictSummary`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});


app.get("/api/Login/Menu", async (req, res) => {
  try {
    let roleId = req.query.userId; // Get roleId from request

    // Ensure roleId is a valid number/string, else assign default '1'
    if (!roleId || roleId.trim() === "") {
      roleId = "1";
    }

    console.log("🔍 roleId being sent:", roleId); // Debugging
    const response = await axios.get(
      `${DOTNET_API_URL}/api/Login/Menu?userId=${roleId}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get("/api/SubStation/GetSubStationData", async (req, res) => {
  try {
    const { dist_code, augmny } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/SubStation/GetSubStationData`,
      {
        params: { dist_code, augmny },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// /api/SubStation/GetRemainingSolarCapacitySubstationsData?dist_code=${DIST_CODE}&augmny=${augmny}
app.get(
  "/api/SubStation/GetRemainingSolarCapacitySubstationsData",
  async (req, res) => {
    try {
      const { dist_code, augmny } = req.query;
      const response = await axios.get(
        `${DOTNET_API_URL}/api/SubStation/GetRemainingSolarCapacitySubstationsData`,
        {
          params: { dist_code, augmny },
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      res.json(response.data); // Send response back to frontend
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  }
);
// /api/SubstationApi/GetSubStationStatus?dist_code=${Dist_Code}&status1=${status}
app.get("/api/SubstationApi/GetSubStationStatus", async (req, res) => {
  try {
    const { dist_code, status1 } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/SubstationApi/GetSubStationStatus`,
      {
        params: { dist_code, status1 },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
// /api/SubstationApi/GetAugmentationSubStationStatus?dist_code=${Dist_Code}&status1=${status}&aug_Y_N=Y
app.get(
  "/api/SubstationApi/GetAugmentationSubStationStatus",
  async (req, res) => {
    try {
      const { dist_code, status1, aug_Y_N } = req.query;
      const response = await axios.get(
        `${DOTNET_API_URL}/api/SubstationApi/GetAugmentationSubStationStatus`,
        {
          params: { dist_code, status1, aug_Y_N },
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  }
);
// /api/SubstationApi/GetTenderSubStationStatus?dist_code=${Dist_Code}&status1=Completed&clusterNo=${Dist_Code}
app.get("/api/SubstationApi/GetTenderSubStationStatus", async (req, res) => {
  try {
    const { dist_code, status1, clusterNo } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/SubstationApi/GetTenderSubStationStatus`,
      {
        params: { dist_code, status1, clusterNo },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
// /api/SubstationApi/GetRemainingSubStationStatus?dist_code=${Dist_Code}&status1=${status}
app.get("/api/SubstationApi/GetRemainingSubStationStatus", async (req, res) => {
  try {
    const { dist_code, status1 } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/SubstationApi/GetRemainingSubStationStatus`,
      {
        params: { dist_code, status1 },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get("/api/TenderingSPVDashboard", async (req, res) => {
  try {
    const { sfile_id } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/TenderingSPVDashboard`,
      {
        params: { sfile_id },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    // console.log(response.data);
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get("/api/ClusterSummaryData", async (req, res) => {
  try {
    const { sfile_id } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/ClusterSummaryData`,
      {
        params: { sfile_id },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    // console.log(response.data);
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get("/api/ClusterSummaryAddEdit", async (req, res) => {
  try {
    const { v_clusterSummeryID, sfile_id, str_action } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/ClusterSummaryAddEdit`,
      {
        params: { v_clusterSummeryID, sfile_id, str_action },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get("/api/LetterOfIntentData", async (req, res) => {
  try {
    const { sfile_id } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/LetterOfIntentData`,
      {
        params: { sfile_id },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get("/api/LetterOfIndentAddEdit", async (req, res) => {
  try {
    const { v_loiID, sfile_id, DistCode } = req.query;

    const response = await axios.get(
      `${DOTNET_API_URL}/api/LetterOfIndentAddEdit`,
      {
        params: { v_loiID, sfile_id, DistCode },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get("/api/GetSummeryOfCapacity", async (req, res) => {
  try {
    const { DistCode, v_loiID } = req.query;

    const response = await axios.get(
      `${DOTNET_API_URL}/api/GetSummeryOfCapacity`,
      {
        params: { DistCode, v_loiID },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});


app.post("/api/InsertUpdateLetterOfIndent", async (req, res) => {
    try {   
        const response = await axios.post(
            `${DOTNET_API_URL}/api/InsertUpdateLetterOfIndent`,
            req.body
        );
        res.json(response.data);
    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ error: "Failed to insert/update data" });
    }
});



app.get("/api/MercAdoptionOrderData", async (req, res) => {
  try {
    const { sfile_id } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/MercAdoptionOrderData`,
      {
        params: { sfile_id },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get("/api/MercAdoptionOrderAddEdit", async (req, res) => {
  try {
    const { v_mercId, sfile_id, DistCode } = req.query;

    const response = await axios.get(
      `${DOTNET_API_URL}/api/MercAdoptionOrderAddEdit`,
      {
        params: { v_mercId, sfile_id, DistCode },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.post("/api/InsertUpdateMercAdoptionOrder", async (req, res) => {
  try {   
      const response = await axios.post(
          `${DOTNET_API_URL}/api/InsertUpdateMercAdoptionOrder`,
          req.body
      );
      res.json(response.data);
  } catch (error) {
      console.error("❌ Error:", error.message);
      res.status(500).json({ error: "Failed to insert/update data" });
  }
});


// Admin Panel
app.get("/api/RoleModelData", async (req, res) => {
  try {
    const { sfile_id } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/RoleModelData`,
      {
        params: { sfile_id },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
app.get("/api/UserRoleDataEdit", async (req, res) => {
  try {
    const { sRoleID, sfile_id } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/UserRoleDataEdit`,
      {
        params: { sRoleID, sfile_id },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.post("/api/InsertUpdateRoleData", async (req, res) => {
  console.log("📥 Incoming Request Body:", req.body);

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "❌ No data received in request body" });
  }

  try {   
      const response = await axios.post(
          `${DOTNET_API_URL}/api/InsertUpdateRoleData`,
          req.body
      );
      console.log("📤 Forwarding to DOTNET API:", req.body);
      res.json(response.data);
  } catch (error) {
      console.error("❌ Main Error:", error.message);
      res.status(500).json({ error: "Failed to insert/update data" });
  }
});



app.get("/api/UserCreationData", async (req, res) => {
  try {
    const { sfile_id } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/UserCreationData`,
      {
        params: { sfile_id },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
app.get("/api/UserCreationDataEdit", async (req, res) => {
  try {
    const { LoginId } = req.query;

    const response = await axios.get(
      `${DOTNET_API_URL}/api/UserCreationDataEdit`,
      {
        params: { LoginId },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
app.post("/api/InsertUpdateUserCreation", async (req, res) => {
  console.log("📥 Incoming Request Body:", req.body);

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "❌ No data received in request body" });
  }

  try {   
      const response = await axios.post(
          `${DOTNET_API_URL}/api/InsertUpdateUserCreation`,
          req.body
      );
      console.log("📤 Forwarding to DOTNET API:", req.body);
      res.json(response.data);
  } catch (error) {
      console.error("❌ Main Error:", error.message);
      res.status(500).json({ error: "Failed to insert/update data" });
  }
});

// MSKVY 2.0 Dashboards
// SWP Clearances - Cluster & open tender
app.get("/api/ClusterSWPClearanceSummaryData", async (req, res) => {
  try {
    const { sfile_id } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/ClusterSWPClearanceSummaryData`,
      {
        params: { sfile_id },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
app.get("/api/OpenTenderSWPClearanceSummaryData", async (req, res) => {
  try {
    const { sfile_id } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/OpenTenderSWPClearanceSummaryData`,
      {
        params: { sfile_id },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
app.get("/api/SWPSubStationsClearanceSummaryData", async (req, res) => {
  try {
    const { projectCode, sfile_id, approachType } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/SWPSubStationsClearanceSummaryData`,
      {
        params: { projectCode, sfile_id, approachType },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
app.get("/api/SWPClearanceSummaryStageWise", async (req, res) => {
  try {
    const { substationCode, ProjectCapacity, sfile_id, headerName, projectCode, approachType } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/SWPClearanceSummaryStageWise`,
      {
        params: { substationCode, ProjectCapacity, sfile_id, headerName, projectCode, approachType },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// MSKVY 2.0 Dashboards
// System Strengthening
app.get("/api/SystemStrengtheningData", async (req, res) => {
  try {
    const { sfile_id } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/SystemStrengtheningData`,
      {
        params: { sfile_id },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
app.get("/api/SystemStrengtheningSubStations", async (req, res) => {
  try {
    const { summaryId, ReferenceNo, approachType , Issplit, sfile_id } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/SystemStrengtheningSubStations`,
      {
        params: { summaryId, ReferenceNo, approachType , Issplit, sfile_id },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
app.get("/api/SystemStrengtheningSSNoDetails", async (req, res) => {
  try {
    const { SS_No, approachType , Issplit, sfile_id } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/SystemStrengtheningSSNoDetails`,
      {
        params: { SS_No, approachType , Issplit, sfile_id },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
app.get("/api/SystemStrengtheningSubstationActivityStaus", async (req, res) => {
  try {
    const { mskvyType, Status, sfile_id } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/SystemStrengtheningSubstationActivityStaus`,
      {
        params: { mskvyType, Status, sfile_id },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
app.get("/api/SystemStrengtheningSSNoStatus", async (req, res) => {
  try {
    const { SS_No, mskvyType, Status, sfile_id } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/SystemStrengtheningSSNoStatus`,
      {
        params: { SS_No, mskvyType, Status, sfile_id },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
app.get("/api/SubstationsDoughnutClick", async (req, res) => {
  try {
    const { summaryId, ReferenceNo, approachType, Issplit, sfile_id, status } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/SubstationsDoughnutClick`,
      {
        params: { summaryId, ReferenceNo, approachType, Issplit, sfile_id, status },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
app.get("/api/SystemStrengtheningSSNoDetails_New", async (req, res) => {
  try {
    const { SS_No, summaryId, ReferenceNo, approachType, Issplit, sfile_id, status } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/SystemStrengtheningSSNoDetails_New`,
      {
        params: { SS_No, summaryId, ReferenceNo, approachType, Issplit, sfile_id, status },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log(response.data);
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Project Execution Summary 
app.get("/api/projectExecutionSummary", async (req, res) => {
  try {
    // const { SS_No, summaryId, ReferenceNo, approachType, Issplit, sfile_id, status } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/projectExecutionSummary`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log(response.data);
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
app.get("/api/GetBidderDetails", async (req, res) => {
  try {
    const { strBidder, infoType} = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/GetBidderDetails`,
      {
        params: { strBidder, infoType },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log(response.data);
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
app.get("/api/GetBidderWiseDetails", async (req, res) => {
  console.log(req.query)
  try {
    const { ModelData, bidderName, District} = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/GetBidderWiseDetails`,
      {
        params: { ModelData, bidderName, District },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log(response.data);
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
app.get("/api/GetDistrictWiseDetails", async (req, res) => {
  try {
    const { ModelData, bidderName, District} = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/GetDistrictWiseDetails`,
      {
        params: { ModelData, bidderName, District },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log(response.data);
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
app.get("/api/CommissionedSS", async (req, res) => {
  try {
    const { ModelData, apprType} = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/CommissionedSS`,
      {
        params: { ModelData, apprType },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log(response.data);
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});


app.get("/api/SPVListForAdminDashboard", async (req, res) => {
  try {
    const { sfile_Id} = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/SPVListForAdminDashboard`,
      {
        params: { sfile_Id },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log(response.data);
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
app.get("/api/AdminDashboardForSPV", async (req, res) => {
  try {
    const { PPA_Referance_No, sfile_Id} = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/AdminDashboardForSPV`,
      {
        params: { PPA_Referance_No, sfile_Id },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log(response.data);
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});
app.get("/api/DashboardSPV", async (req, res) => {
  try {
    const { sfile_Id, Summary_Id, Reference_NO, ApproachType, Is_Split } = req.query;
    const response = await axios.get(
      `${DOTNET_API_URL}/api/DashboardSPV`,
      {
        params: { sfile_Id, Summary_Id, Reference_NO, ApproachType, Is_Split },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log(response.data);
    res.json(response.data); // Send response back to frontend
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Express Backend running on http://localhost:${PORT}`);
});
