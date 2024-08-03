import React from 'react';
import axios from "axios";
import { API_URL } from "../constants.js"
import { saveAs } from 'file-saver';

function FiedlGroup({ labelText, children }) {
    return (
        <div className="field-block">
            <label>
                {labelText}
            </label>
            {children}
        </div>
    )
}

function PeriodFieldGroup({ labelText, yearsFieldName, monthsFieldName, calculatorState, handleChange }) {
    return (
        <FiedlGroup labelText={labelText}>
            <div className="inputs-group">
                <div>
                    <label className="period-fields-group">
                        лет
                    </label>
                    <input type="number" name={yearsFieldName} value={calculatorState[yearsFieldName]} onChange={handleChange} />
                </div>
                <div className="period-fields-group">
                    <label>
                        месяцев
                    </label>
                    <input type="number" name={monthsFieldName} value={calculatorState[monthsFieldName]} onChange={handleChange} />
                </div>
            </div>
        </FiedlGroup>
    )
}

class Calculator extends React.Component {
    state = this.props.storedState;

    handleSubmit = async (e) => {
        e.preventDefault();
        const { target } = this.props;
        const routeDictionary = {
            insurancePremium: "insurance_premium/",
            insuranceSum: "insurance_sum/",
            reserve: "reserve/",
            tariffs: "tariffs/"
        }

        let requestData = {
            insuranceType: this.state.insuranceType,
            insurancePremiumFrequency: this.state.insurancePremiumFrequency,
            gender: this.state.gender,
            insurancePremiumRate: this.state.insurancePremiumRate,
            insuranceLoading: this.state.insuranceLoading
        };

        if (target !== "tariffs") {
            if (this.state.insuranceType !== "чисто накопительное страхование") {
                requestData.birthDate = this.state.birthDate;
                requestData.insuranceStartDate = this.state.insuranceStartDate;
            } 
            if (this.state.insuranceType !== "пожизненное страхование") {
                requestData.insurancePeriod = 12 * Number(this.state.insurancePeriodYears) + Number(this.state.insurancePeriodMonths);
            }
            switch (target) {
                case 'insurancePremium':
                    requestData.insuranceSum = this.state.insuranceSum;
                    break;
                case 'insuranceSum':
                    requestData.insurancePremium = this.state.insurancePremium;
                    break;
                // if target=reserve
                default:
                    if (this.state.inputVariable === "insurancePremium") {
                        requestData.insurancePremium = this.state.insurancePremium;
                    } else {
                        requestData.insuranceSum = this.state.insuranceSum;
                    }

                    requestData.reserveCalculationPeriod = 12 * Number(this.state.reservePeriodYears) + Number(this.state.reservePeriodMonths);
            }
        } else {
            requestData.insuranceStartAge = this.state.insuranceStartAge;
            requestData.insuranceEndAge = this.state.insuranceEndAge;
            requestData.maximumInsurancePeriod = 12 * Number(this.state.maximumInsurancePeriodYears) + Number(this.state.maximumInsurancePeriodMonths);
        }

        const requestParameters = target !== "tariffs" ? null : { responseType: "blob" }
        try {
            const response = await axios.post(API_URL + routeDictionary[target], requestData, requestParameters);
            if (target !== "tariffs") {
                let value = response.data.result;
                this.setState({ result: value });
                this.props.updateStoredState("result", value);
            } else {
                const blob = new Blob([response.data], { type: response.headers['content-type'] });
                saveAs(blob, 'tariffs.xlsx');

            }
        } catch (error) {
            console.error(`Error while sending request to ${routeDictionary[target]}`, error);
        }

        // axios.post(API_URL + routeDictionary[target], requestData).then((response) => {
        //     let value = response.data.result;
        //     this.setState({ result: value });
        //     this.props.updateStoredState("result", value);
        // });
    }

    // TODO code duplication
    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        });
        this.props.updateStoredState(name, value);
    };

    render() {
        const { target } = this.props;

        const targetDictionary = {
            "insurancePremium": "Cтраховой взнос=",
            "insuranceSum": "Cтраховая сумма=",
            "reserve": "Резерв="
        }

        return (
            <div className="App">
                <form onSubmit={this.handleSubmit}>
                    <FiedlGroup labelText="Выберите тип страхования:">
                        <select name="insuranceType" value={this.state.insuranceType} onChange={this.handleChange}>
                            <option>чистое дожитие</option>
                            <option>страхование жизни на срок</option>
                            <option>чисто накопительное страхование</option>
                            <option>пожизненное страхование</option>
                        </select>
                    </FiedlGroup>
                    <FiedlGroup labelText="Выберите вариант уплаты страхового взноса:">
                        <select name="insurancePremiumFrequency" value={this.state.insurancePremiumFrequency} onChange={this.handleChange}>
                            <option>единовременно</option>
                            <option>ежегодно</option>
                            <option>ежемесячно</option>
                        </select>
                    </FiedlGroup>
                    <FiedlGroup labelText="Выберите пол застрахованного:">
                        <select name="gender" value={this.state.gender} onChange={this.handleChange}>
                            <option>мужской</option>
                            <option>женский</option>
                        </select>
                    </FiedlGroup>
                    {target === "tariffs" && (
                        <React.Fragment>
                            {this.state.insuranceType !== "чисто накопительное страхование" && (
                                <React.Fragment>
                                    <FiedlGroup labelText="Введите начальный возраст страхования в годах:">
                                        <input type="number" name="insuranceStartAge" value={this.state.insuranceStartAge} onChange={this.handleChange} />
                                    </FiedlGroup>
                                    <FiedlGroup labelText="Введите конечный возраст страхования в годах:">
                                        <input type="number" name="insuranceEndAge" value={this.state.insuranceEndAge} onChange={this.handleChange} />
                                    </FiedlGroup>
                                </React.Fragment>
                            )}

                            {this.state.insuranceType !== "пожизненное страхование" && (
                                this.state.insuranceType !== "чисто накопительное страхование" ? (
                                    <FiedlGroup labelText="Введите максимальный период страхования в годах:">
                                        <input type="number" name="maximumInsurancePeriodYears" value={this.state.maximumInsurancePeriodYears} onChange={this.handleChange} />
                                    </FiedlGroup>
                                ) : (
                                    <PeriodFieldGroup
                                        labelText="Введите максимальный период страхования:"
                                        yearsFieldName="maximumInsurancePeriodYears"
                                        monthsFieldName="maximumInsurancePeriodMonths"
                                        calculatorState={this.state}
                                        handleChange={this.handleChange}
                                    />
                                )
                            )}
                        </React.Fragment>
                    )}
                    {target !== "tariffs" && (
                        <React.Fragment>
                            {this.state.insuranceType !== "чисто накопительное страхование" && (
                                <React.Fragment>
                                    <FiedlGroup labelText="Введите дату рождения застрахованного:">
                                        <input type="date" name="birthDate" value={this.state.birthDate} onChange={this.handleChange} />
                                    </FiedlGroup>
                                    <FiedlGroup labelText="Введите дату начала страхования:">
                                        <input type="date" name="insuranceStartDate" value={this.state.insuranceStartDate} onChange={this.handleChange} />
                                    </FiedlGroup>
                                </React.Fragment>
                            )}
                            {this.state.insuranceType !== "пожизненное страхование" && (
                                <PeriodFieldGroup
                                    labelText="Введите период страхования:"
                                    yearsFieldName="insurancePeriodYears"
                                    monthsFieldName="insurancePeriodMonths"
                                    calculatorState={this.state}
                                    handleChange={this.handleChange}
                                />
                            )}
                        </React.Fragment>
                    )}
                    <FiedlGroup labelText="Введите доходность для страхового взноса:">
                        <input type="text" name="insurancePremiumRate" value={this.state.insurancePremiumRate} onChange={this.handleChange} />
                    </FiedlGroup>
                    <FiedlGroup labelText="Введите нагрузку (от 0 до 1, не включая 1):">
                        <input type="text" name="insuranceLoading" value={this.state.insuranceLoading} onChange={this.handleChange} />
                    </FiedlGroup>
                    {(target === "insuranceSum") && (
                        <FiedlGroup labelText="Введите страховой взнос:">
                            <input type="text" name="insurancePremium" value={this.state.insurancePremium} onChange={this.handleChange} />
                        </FiedlGroup>
                    )}
                    {(target === "insurancePremium") && (
                        <FiedlGroup labelText="Введите страховую сумму:">
                            <input type="text" name="insuranceSum" value={this.state.insuranceSum} onChange={this.handleChange} />
                        </FiedlGroup>
                    )}
                    {(target === "reserve") && (
                        <React.Fragment>
                            <div className="field-block">
                                <input
                                    type="radio"
                                    name="inputVariable"
                                    value="insurancePremium"
                                    checked={this.state.inputVariable === "insurancePremium"}
                                    onChange={this.handleChange}
                                />
                                <label>Введите страховой взнос:</label>
                                <input
                                    type="text"
                                    name="insurancePremium"
                                    value={this.state.insurancePremium}
                                    onChange={this.handleChange}
                                    disabled={this.state.inputVariable !== "insurancePremium"}
                                />
                            </div>
                            <div className="field-block">
                                <input
                                    type="radio"
                                    name="inputVariable"
                                    value="insuranceSum"
                                    checked={this.state.inputVariable === "insuranceSum"}
                                    onChange={this.handleChange}
                                />
                                <label>Введите страховую сумму:</label>
                                <input
                                    type="text"
                                    name="insuranceSum"
                                    value={this.state.insuranceSum}
                                    onChange={this.handleChange}
                                    disabled={this.state.inputVariable !== "insuranceSum"}
                                />
                            </div>
                            <PeriodFieldGroup
                                labelText="Введите время от начала страхования до расчёта резерва:"
                                yearsFieldName="reservePeriodYears"
                                monthsFieldName="reservePeriodMonths"
                                calculatorState={this.state}
                                handleChange={this.handleChange}
                            />
                        </React.Fragment>
                    )}
                    <button type="submit">Вычислить</button>
                    {(target !== "tariffs" && this.state.result) && (
                        <div className="result-display">
                            {targetDictionary[target]}{this.state.result}
                        </div>
                    )}
                </form>
            </div>
        );
    }
}

export default Calculator;