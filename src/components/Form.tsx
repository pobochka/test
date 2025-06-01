import axios from "axios";
import React from "react";
import { useState, useEffect } from "react";

interface RecordData {
  [key: string]: any;
}

const Form: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [fieldKey, setFieldKey] = useState<string[]>([]);
  const [formData, setFormData] = useState<RecordData>({});
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:3001/posts?_limit=1");

        if (!res.data || res.data.length === 0) {
          setError("Error: нет данных для создания формы");
          return;
        }

        const fields = Object.keys(res.data[0]);
        if (fields.length < 5) {
          setError("Error: количество полей меньше 5");
          setFieldKey([]);
          setFormData({});
          return;
        }

        setFieldKey(fields);
        setError(null);

        const newData: RecordData = {};
        fields.forEach((key) => {
          newData[key] = "";
        });

        setFormData(newData);
      } catch (error) {
        setError("Error: не удалось загрузить данные");
      }
    };
    fetchData();
  }, []);

  const handleChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [el.target.name]: el.target.value });
  };

  const submitting = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSend = { ...formData };

      // Преобразуем числовые поля
      Object.keys(dataToSend).forEach((key) => {
        if (key === "views" || key === "likes" || key === "id") {
          const value = dataToSend[key];
          dataToSend[key] = value && value !== "" ? parseInt(value) : 0;
        }
        // Убираем пустые строки для других полей
        if (dataToSend[key] === "") {
          dataToSend[key] = null;
        }
        setSubmitted(true);

        setTimeout(() => {
          setSubmitted(false);
        }, 3000);
      });

      await axios.post("http://localhost:3001/posts", dataToSend);

      const clear: RecordData = {};
      fieldKey.forEach((key) => {
        clear[key] = "";
      });

      setFormData(clear);

      onSuccess();
    } catch (error: any) {
      setError("Ошибка при сохранении:");
    }
  };

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <>
      <form
        style={{ marginInline: "0.5rem", marginBottom: "2rem" }}
        onSubmit={submitting}
        className="row row-cols-lg-auto g-3 align-items-center"
      >
        {fieldKey.map((key) => (
          <div className="col-12">
            <input
              className="form-control"
              name={key}
              type={
                key === "views" || key === "likes" || key === "id"
                  ? "number"
                  : "text"
              }
              value={formData[key] || ""}
              placeholder={key}
              onChange={handleChange}
              disabled={submitted}
            />
          </div>
        ))}
        <div className="col-auto">
          <button
            type="submit"
            disabled={submitted}
            className="btn btn-primary"
          >
            {!submitted ? `Add` : `Adding...`}
          </button>
        </div>
      </form>
    </>
  );
};

export default Form;
