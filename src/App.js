import React, { useState } from 'react';
import './App.css';
import axios from "axios";

const API_URL = "http://localhost:8000/calculate/insurance_sum/"


const App = () => {
  const [formData, setFormData] = useState({
    insuranceType: 'чистое дожитие',
    insurancePremiumFrequency: 'единовременно',
    gender: 'мужской',
    birthDate: '',
    insuranceStartDate: '',
    insuranceEndDate: '',
    insurancePremiumRate: '',
    insurancePremiumSupplement: '',
    insurancePremium: ''
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, } = e.target;
    // console.log(name, value);
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Calculation logic goes here  
    axios.post(API_URL, formData).then((response) => {
      setResult(response.data.result)
      // console.log(response);
    });
    // console.log(formData);
  };

  return (
    <div className="App">
      <h1>Расчёт страховой суммы</h1>
      <form onSubmit={handleSubmit}>
        <div className="field-block">
          <label>
            Выберите тип страхования:
          </label>
          <select name="insuranceType" value={formData.insuranceType} onChange={handleChange}>
            <option>чистое дожитие</option>
            <option>страхование жизни на срок</option>
            <option>чисто накопительное страхование</option>
            <option>пожизненное страхование</option>
            {/* Add more options if needed */}
          </select>
        </div>
        <div className="field-block">
          <label>
            Выберите вариант уплаты страхового взноса:
          </label>
          <select name="insurancePremiumFrequency" value={formData.insurancePremiumFrequency} onChange={handleChange}>
            <option>единовременно</option>
            <option>ежегодно</option>
            <option>ежемесячно</option>
            {/* Add more options if needed */}
          </select>
        </div>
        <div className="field-block">
          <label>
            Выберите пол застрахованного:
          </label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option>мужской</option>
            <option>женский</option>
          </select>
        </div>
        <div className="field-block">
          <label>
            Введите дату рождения застрахованного:
          </label>
          <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} />
        </div>
        <div className="field-block">
          <label>
            Введите дату начала страхования:
          </label>
          <input type="date" name="insuranceStartDate" value={formData.insuranceStartDate} onChange={handleChange} />
        </div>
        <div className="field-block">
          <label>
            Введите дату окончания страхования:
          </label>
          <input type="date" name="insuranceEndDate" value={formData.insuranceEndDate} onChange={handleChange} />
        </div>
        <div className="field-block">
          <label>
            Введите доходность для страхового взноса:
          </label>
          <input type="text" name="insurancePremiumRate" value={formData.insurancePremiumRate} onChange={handleChange} />
        </div>
        <div className="field-block">
          <label>
            Введите нагрузку (от 0 до 1, не включая 1):
          </label>
          <input type="text" name="insurancePremiumSupplement" value={formData.insurancePremiumSupplement} onChange={handleChange} />
        </div>
        <div className="field-block">
          <label>
            Введите страховой взнос:
          </label>
          <input type="text" name="insurancePremium" value={formData.insurancePremium} onChange={handleChange} />
        </div>
        {result && <div>Страховая сумма={result}</div>}
        <button type="submit">Вычислить</button>
      </form>
    </div>
  );
};

export default App;
