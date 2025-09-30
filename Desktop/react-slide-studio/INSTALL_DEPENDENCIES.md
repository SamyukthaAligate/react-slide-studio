# 📦 Install New Dependencies

## Required for PDF Export Feature

To use the PDF download feature, you need to install two new libraries:

---

## 🚀 Quick Install

### **Run this command:**

```bash
npm install
```

This will install:
- `html2canvas@^1.4.1` - For capturing slides as images
- `jspdf@^2.5.1` - For creating PDF files

---

## 📋 Step-by-Step

### **1. Stop the Development Server**
If the app is running, press `Ctrl+C` in the terminal

### **2. Install Dependencies**
```bash
cd c:\Users\Welcome\Desktop\react-slide-studio
npm install
```

### **3. Start the App Again**
```bash
npm start
```

---

## ✅ Verification

After installation, you should see:
```
added 2 packages, and audited X packages in Xs
```

---

## 🎯 Test PDF Export

1. App opens in browser
2. Click **File → Download as PDF**
3. PDF should generate and download

---

## 🐛 If Installation Fails

### **Clear npm cache:**
```bash
npm cache clean --force
npm install
```

### **Delete node_modules and reinstall:**
```bash
rmdir /s node_modules
npm install
```

---

**After installation, the PDF export feature will be fully functional!** 📄
