import React from 'react';
import axios from "axios";
import { API_URL } from "../constants.js"

class Calculator extends React.Component {
    state = {
        insuranceType: 'чистое дожитие',
        insurancePremiumFrequency: 'единовременно',
        gender: 'мужской',
        birthDate: '',
        insuranceStartDate: '',
        insuranceEndDate: '',
        insurancePremiumRate: '',
        insurancePremiumSupplement: '',
        insurancePremium: '',
        insuranceSum: '',
        result: null
    };

    handleSubmit = (e) => {
        e.preventDefault();
        const { target } = this.props;

        let requestData = {
            insuranceType: this.state.insuranceType,
            insurancePremiumFrequency: this.state.insurancePremiumFrequency,
            gender: this.state.gender,
            birthDate: this.state.birthDate,
            insuranceStartDate: this.state.insuranceStartDate,
            insuranceEndDate: this.state.insuranceEndDate,
            insurancePremiumRate: this.state.insurancePremiumRate,
            insurancePremiumSupplement: this.state.insurancePremiumSupplement
        };

        console.log(target);
        if (target === "Страховой взнос") {
            requestData.insuranceSum = this.state.insuranceSum;
        } else if (target === "Страховую сумму") {
            requestData.insurancePremium = this.state.insurancePremium;
        }

        axios.post(API_URL, requestData).then((response) => {
            this.setState({ result: response.data.result })
        });
    }

    // TODO code duplication
    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        });
    };
s
    render() {
        const { target } = this.props;

        const targetDictionary = {
            "insuranceSum": {
                inputFieldName: "insurancePremium",
                inputLabel: "Введите страховой взнос:",
                resultLabel: "Cтраховая сумма=",
                value: this.state.insurancePremium
            },
            "insurancePremium": {
                inputFieldName: "insuranceSum",
                inputLabel: "Введите страховую сумму:",
                resultLabel: "Cтраховой взнос=",
                value: this.state.insuranceSum
            }
        }

        return (
            <div className="App">
                <form onSubmit={this.handleSubmit}>
                    <div className="field-block">
                        <label>
                            Выберите тип страхования:
                        </label>
                        <select name="insuranceType" value={this.state.insuranceType} onChange={this.handleChange}>
                            <option>чистое дожитие</option>
                            <option>страхование жизни на срок</option>
                            <option>чисто накопительное страхование</option>
                            <option>пожизненное страхование</option>
                        </select>
                    </div>
                    <div className="field-block">
                        <label>
                            Выберите вариант уплаты страхового взноса:
                        </label>
                        <select name="insurancePremiumFrequency" value={this.state.insurancePremiumFrequency} onChange={this.handleChange}>
                            <option>единовременно</option>
                            <option>ежегодно</option>
                            <option>ежемесячно</option>
                        </select>
                    </div>
                    <div className="field-block">
                        <label>
                            Выберите пол застрахованного:
                        </label>
                        <select name="gender" value={this.state.gender} onChange={this.handleChange}>
                            <option>мужской</option>
                            <option>женский</option>
                        </select>
                    </div>
                    <div className="field-block">
                        <label>
                            Введите дату рождения застрахованного:
                        </label>
                        <input type="date" name="birthDate" value={this.state.birthDate} onChange={this.handleChange} />
                    </div>
                    <div className="field-block">
                        <label>
                            Введите дату начала страхования:
                        </label>
                        <input type="date" name="insuranceStartDate" value={this.state.insuranceStartDate} onChange={this.handleChange} />
                    </div>
                    <div className="field-block">
                        <label>
                            Введите дату окончания страхования:
                        </label>
                        <input type="date" name="insuranceEndDate" value={this.state.insuranceEndDate} onChange={this.handleChange} />
                    </div>
                    <div className="field-block">
                        <label>
                            Введите доходность для страхового взноса:
                        </label>
                        <input type="text" name="insurancePremiumRate" value={this.state.insurancePremiumRate} onChange={this.handleChange} />
                    </div>
                    <div className="field-block">
                        <label>
                            Введите нагрузку (от 0 до 1, не включая 1):
                        </label>
                        <input type="text" name="insurancePremiumSupplement" value={this.state.insurancePremiumSupplement} onChange={this.handleChange} />
                    </div>
                    <div className="field-block">
                        <label>
                            {targetDictionary[target].inputLabel}
                        </label>
                        <input type="text" name={targetDictionary[target].inputFieldName} value={targetDictionary[target].value} onChange={this.handleChange} />
                    </div>                 
                    <button type="submit">Вычислить</button>
                    {this.state.result && (
                        <div className="result-display">
                            {targetDictionary[target].resultLabel}{this.state.result}
                        </div>
                    )}
                </form>
            </div>
        );
    }
}

export default Calculator;