import logo from './logo.svg';
import './App.css';

import React, { useState } from 'react';
import './App.css';
import axios from "axios";

const API_URL = "http://localhost:8000/calculate/insurance_sum/"


const App = () => {
  const [formData, setFormData] = useState({
    insuranceType: 'чистое дожитие',
    paymentOption: 'единовременно',
    gender: 'мужской',
    birthDate: '',
    insuranceStartDate: '',   
    insuranceEndDate: '',
    paymentRate: '',
    load: '',   
    insurancePremium: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Calculation logic goes here  
    axios.post(API_URL, formData).then(() => {
    });
    console.log(formData);
  };

  return (
    <div className="App">
      <h1>Расчёт страховой суммы</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Выберите тип страхования:
          <select name="insuranceType" value={formData.insuranceType} onChange={handleChange}>
            <option value="чистое дожитие">чистое дожитие</option>
            <option value="чистое дожитие">страхование жизни на срок</option>
            <option value="чистое дожитие">чисто накопительное страхование</option>
            <option value="чистое дожитие">пожизненное страхование</option>
            {/* Add more options if needed */}
          </select>
        </label>
        <label>
          Выберите вариант уплаты страхового взноса:
          <select name="paymentOption" value={formData.paymentOption} onChange={handleChange}>
            <option value="единовременно">единовременно</option>
            <option value="ежегодно">единовременно</option>
            <option value="ежемесячно">единовременно</option>
            {/* Add more options if needed */}
          </select>
        </label>
        <label>
          Выберите пол застрахованного:
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="мужской">мужской</option>
            <option value="женский">женский</option>
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
          <input type="text" name="paymentRate" value={formData.paymentRate} onChange={handleChange} />
        </label>
        <label>
          Введите нагрузку (от 0 до 1, не включая 1):
          <input type="text" name="load" value={formData.load} onChange={handleChange} />
        </label>       
        <label>
          Введите страховой взнос:
          <input type="text" name="insurancePremium" value={formData.insurancePremium} onChange={handleChange} />
        </label>
        <button type="submit">Вычислить</button>
      </form>
    </div>
  );
};

export default App;
