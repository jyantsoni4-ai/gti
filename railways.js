import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// 🔹 Railway backend URL
const API_URL = process.env.REACT_APP_API_URL + "/api/serials";

export default function SerialDatabase() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    product: "",
    control: "",
    wifi: "",
  });

  const productRef = useRef(null);
  const controlRef = useRef(null);
  const wifiRef = useRef(null);
  const savingRef = useRef(false);

  // 🔹 scanner lengths
  const PRODUCT_LEN = 12;
  const CONTROL_LEN = 16;
  const WIFI_LEN = 18;

  // 🔹 fetch serials
  const fetchData = async () => {
    const res = await axios.get(API_URL);
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
    productRef.current?.focus();
  }, []);

  // 🔥 AUTO MOVE + AUTO SAVE (Excel-like)
  useEffect(() => {
    if (form.product.length === PRODUCT_LEN) {
      controlRef.current?.focus();
    }

    if (form.control.length === CONTROL_LEN) {
      wifiRef.current?.focus();
    }

    if (form.wifi.length === WIFI_LEN) {
      autoSave();
    }
  }, [form.product, form.control, form.wifi]);

  // 🔹 auto save
  const autoSave = async () => {
    if (savingRef.current) return;
    if (!form.product || !form.control || !form.wifi) return;

    savingRef.current = true;

    try {
      await axios.post(API_URL, form);

      setForm({ product: "", control: "", wifi: "" });
      fetchData();

      setTimeout(() => productRef.current?.focus(), 100);
    } catch (err) {
      // 🚫 ignore duplicate product (scanner friendly)
      if (err.response?.data?.message !== "Product already exists") {
        console.error(err);
      }
      setForm({ product: "", control: "", wifi: "" });
      setTimeout(() => productRef.current?.focus(), 100);
    } finally {
      savingRef.current = false;
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Serial Database (Scanner Mode)</h2>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          ref={productRef}
          placeholder="Product Serial"
          value={form.product}
          onChange={(e) =>
            setForm({ ...form, product: e.target.value.trim() })
          }
        />

        <input
          ref={controlRef}
          placeholder="Control Serial"
          value={form.control}
          onChange={(e) =>
            setForm({ ...form, control: e.target.value.trim() })
          }
        />

        <input
          ref={wifiRef}
          placeholder="Wi-Fi Serial"
          value={form.wifi}
          onChange={(e) =>
            setForm({ ...form, wifi: e.target.value.trim() })
          }
        />
      </div>
    </div>
  );
}
