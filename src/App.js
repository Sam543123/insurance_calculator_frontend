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
    const { name, value,} = e.target;
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
        <label>
          Выберите тип страхования:
          <select name="insuranceType" value={formData.insuranceType} onChange={handleChange}>
            <option>чистое дожитие</option>
            <option>страхование жизни на срок</option>
            <option>чисто накопительное страхование</option>
            <option>пожизненное страхование</option>
            {/* Add more options if needed */}
          </select>
        </label>
        <label>
          Выберите вариант уплаты страхового взноса:
          <select name="insurancePremiumFrequency" value={formData.insurancePremiumFrequency} onChange={handleChange}>
            <option>единовременно</option>
            <option>ежегодно</option>
            <option>ежемесячно</option>
            {/* Add more options if needed */}
          </select>
        </label>
        <label>
          Выберите пол застрахованного:
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option>мужской</option>
            <option>женский</option>
          </select>
        </label>
        <label>
          Введите дату рождения застрахованного:
          <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} />
        </label>
        <label>
          Введите дату начала страхования:
          <input type="date" name="insuranceStartDate" value={formData.insuranceStartDate} onChange={handleChange} />
        </label>       
        <label>         
          Введите дату окончания страхования:
          <input type="date" name="insuranceEndDate" value={formData.insuranceEndDate} onChange={handleChange} />
        </label>
        <label>
          Введите доходность для страхового взноса:
          <input type="text" name="insurancePremiumRate" value={formData.insurancePremiumRate} onChange={handleChange} />
        </label>
        <label>
          Введите нагрузку (от 0 до 1, не включая 1):
          <input type="text" name="insurancePremiumSupplement" value={formData.insurancePremiumSupplement} onChange={handleChange} />
        </label>       
        <label>
          Введите страховой взнос:
          <input type="text" name="insurancePremium" value={formData.insurancePremium} onChange={handleChange} />
        </label>
        {result && <div>Страховая сумма={result}</div>}
        <button type="submit">Вычислить</button>
      </form>
    </div>
  );
};

export default App;
