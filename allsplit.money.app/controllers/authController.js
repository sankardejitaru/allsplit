//const BASE_URL = "https://mobileapi.myapplications.io"; // change this
const BASE_URL = "http://10.117.45.56:8000"; // change this

export const sendOtp = async (mobile) => {
  try {
    const res = await fetch(`${BASE_URL}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });
    return await res.json();
  } catch (err) {
    return { message: err, success: false };
  }
}

export const verifyOtp = async (jsonData) => {
  try {  
    const res = await fetch(`${BASE_URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData),
    }); 
    return await res.json();
  } catch (err) {
    console.log("AllSplit API Log:", err);
    return { message: "Failed to verify OTP - Invalid OTP", success: false };
  }
};

export const SendBillScan = async (formData) => {
  try {
    
   const res = await fetch(`${BASE_URL}/ocr/scan-bill`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          "accept": "application/json",
        },
        body: formData,
      });
      const data = await res.json();
      console.log("AllSplit API Log:", JSON.stringify(data.items));
      return data;
    } catch (err) {
      // console.log("AllSplit API Log:", err);
      return { message: "Failed to scan bill", success: false };
    }
};

export const checkdevice = async (formData) => {
  try { 
   const res = await fetch(`${BASE_URL}/auth/check-device`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.log("AllSplit API Log:", err);
      return { message: "Failed to check device", success: false };
    }
};


export const loginWithPin = async (formData) => {
  try { 
    
   const res = await fetch(`${BASE_URL}/auth/login-pin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.log("AllSplit API Log:", err);
      return { message: "Failed to check PIN", success: false };
    }
};

export const SetMyPin = async (formData) => {
  try { 
    
   const res = await fetch(`${BASE_URL}/auth/set-pin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.log("AllSplit API Log:", err);
      return { message: "Failed to set PIN", success: false };
    }
};
export const MyOweList = async (formData) => {
  try { 
    
   const res = await fetch(`${BASE_URL}/my-owe-list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
       
      const data = await res.json();
      
      return data;
    } catch (err) {
      console.log("AllSplit API Log:", err);
      return { message: "Failed to fetch My Owe List", success: false };
    }
};

export const MyOweAdd = async (formData) => {
  try { 
    
   const res = await fetch(`${BASE_URL}/save-split`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
       
      const data = await res.json();
      
      return data;
    } catch (err) {
      console.log("AllSplit API Log:", err);
      return { message: "Failed to fetch My Owe List", success: false };
    }
};

export const MyOwePrizeUpdate = async (formData) => {
  try { 
    
   const res = await fetch(`${BASE_URL}/update-price`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
       
      const data = await res.json();
      
      return data;
    } catch (err) {
      console.log("AllSplit API Log:", err);
      return { message: "Failed to fetch My Owe List", success: false };
    }
};
export const getContact = async (formData) => {
  try { 
    
   const res = await fetch(`${BASE_URL}/get-contacts`, {
        method: "Get",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
       
      const data = await res.json();
      
      return data;
    } catch (err) {
      console.log("AllSplit API Log:", err);
      return { message: "Failed to fetch My Owe List", success: false };
    }
};

export const closebill = async (formData) => {
  try { 
    
   const res = await fetch(`${BASE_URL}/close-bill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
       
      const data = await res.json();
      
      return data;
    } catch (err) {
      console.log("AllSplit API Log:", err);
      return { message: "Failed to fetch My Owe List", success: false };
    }
};