import React from "react";
import axios from "axios";
import { API_URL, inputIntegerPattern, inputFloatPattern } from "../constants.js"
import { saveAs } from "file-saver";
import moment from 'moment';

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
                    <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name={yearsFieldName} value={calculatorState[yearsFieldName]} onChange={handleChange} />
                    {calculatorState.errors[yearsFieldName] && <div className="error">{calculatorState.errors[yearsFieldName]}</div>}
                </div>
                <div className="period-fields-group">
                    <label>
                        месяцев
                    </label>
                    <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name={monthsFieldName} value={calculatorState[monthsFieldName]} onChange={handleChange} />
                    {calculatorState.errors[monthsFieldName] && <div className="error">{calculatorState.errors[monthsFieldName]}</div>}
                </div>
            </div>
        </FiedlGroup>
    )
}

class Calculator extends React.Component {
    // state = this.props.storedState;

    constructor(props) {
        super(props);
        let errorsDictionary;
        if (this.props.storedState.errors === null) {
            errorsDictionary = Object.keys(this.props.storedState).filter(
                (f) => !["result", "errors", "isButtonActive"].includes(f)
            ).reduce((acc, field) => {
                acc[field] = null;
                return acc;
            }, {})
        } else {
            errorsDictionary = { ...this.props.storedState.errors };
        }
        this.state = { ...this.props.storedState, errors: errorsDictionary };
    }

    toggleButton = () => {
        const { target } = this.props;
        const allFields = Object.keys(this.state);
        let excludedFields = new Set(["result", "errors", "isButtonActive"]);

        if (target !== "tariffs") {
            ["insuranceStartAge", "insuranceEndAge", "maximumInsurancePeriodYears", "maximumInsurancePeriodMonths"].forEach((v) => { excludedFields.add(v) })
        } else {
            ["birthDate", "insuranceStartDate", "insurancePeriodYears", "insurancePeriodMonths", "insurancePremium", "insuranceSum"].forEach((v) => { excludedFields.add(v) })
        }


        if (target !== "reserve") {
            ["reservePeriodYears", "reservePeriodMonths"].forEach((v) => { excludedFields.add(v) })
        } else {
            if (this.state.inputVariable === "insurancePremium") {
                excludedFields.add("insuranceSum");
            } else {
                excludedFields.add("insurancePremium");
            }
        }

        if (target === "insurancePremium") {
            excludedFields.add("insurancePremium")
        } else if (target === "insuranceSum") {
            excludedFields.add("insuranceSum");
        }

        if (this.state.insuranceType !== "чисто накопительное страхование") {
            ["maximumInsurancePeriodMonths", "maximumInsurancePeriodYears"].forEach((v) => { excludedFields.add(v) });
            if (this.state.insuranceType === "пожизненное страхование") {
                ["maximumInsurancePeriodYears", "insurancePeriodYears", "insurancePeriodMonths"].forEach((v) => { excludedFields.add(v) })
            }
        } else {
            ["insuranceStartAge", "insuranceEndAge", "birthDate", "insuranceStartDate, maximumInsurancePeriod"].forEach((v) => { excludedFields.add(v) });
        }

        const trackedFields = allFields.filter((v) => !excludedFields.has(v));
        if (trackedFields.every((v) => this.state[v] !== "") && trackedFields.every((v) => !this.state.errors[v])) {
            if (this.state.isButtonActive === false) {
                this.setState({ isButtonActive: true });
            }
        } else {
            if (this.state.isButtonActive === true) {
                this.setState({ isButtonActive: false });
            }
        }
    }

    validate = (fieldName, updatedState) => {
        let newErrors = { ...updatedState.errors, [fieldName]: null };
        let fieldsToValidate;
        let commonError;
        const currentDate = new Date();

        if (fieldName === "insuranceLoading") {
            if (updatedState.insuranceLoading !== "" && (updatedState.insuranceLoading < 0 || updatedState.insuranceLoading >= 1)) {
                newErrors[fieldName] = "Insurance loading must be greater than or equal to 0 and less than 1.";
            }
        } else if (fieldName === "insurancePremiumRate") {
            if (updatedState.insurancePremiumRate !== "" && updatedState.insurancePremiumRate < 0) {
                newErrors[fieldName] = "Insurance premium rate can't be less than 0.";
            }
        } else if (fieldName === "insurancePremium") {
            if (updatedState.insurancePremium !== "" && updatedState.insurancePremium < 0) {
                newErrors[fieldName] = "Insurance premium must be greater than 0.";
            }
        } else if (fieldName === "insuranceSum") {
            if (updatedState.insuranceSum !== "" && updatedState.insuranceSum < 0) {
                newErrors[fieldName] = "Insurance sum must be greater than 0.";
            }
        } else if (fieldName === "maximumInsurancePeriodYears" || fieldName === "maximumInsurancePeriodMonths") {
            commonError = "Maximum insurance period must be greater than 0.";
            fieldsToValidate = ["maximumInsurancePeriodYears", "maximumInsurancePeriodMonths"];
            fieldsToValidate.forEach((v) => {
                if (newErrors[v] === commonError) {
                    newErrors[v] = null;
                }
            });
            if (fieldName === "maximumInsurancePeriodYears") {
                if (updatedState.maximumInsurancePeriodYears !== "" && updatedState.maximumInsurancePeriodYears < 0) {
                    newErrors[fieldName] = "Number of years in maximum insurance period years can't be less than 0.";
                }
            } else {
                if (updatedState.maximumInsurancePeriodMonths !== "" && (updatedState.maximumInsurancePeriodMonths < 0 || updatedState.maximumInsurancePeriodMonths > 11)) {
                    newErrors[fieldName] = "Number of months in maximum insurance period must be between 0 and 11.";
                }
            }
            if (!newErrors.maximumInsurancePeriodYears && !newErrors.maximumInsurancePeriodMonths) {
                if (fieldsToValidate.every((v) => updatedState[v] !== "") && (updatedState.maximumInsurancePeriodYears === 0 && updatedState.maximumInsurancePeriodMonths === 0)) {
                    newErrors[fieldName] = commonError;
                }
            }
        } else if (["insuranceStartAge", "insuranceEndAge", "maximumInsurancePeriod"].includes(fieldName)) {
            commonError = "Age of insurance start can't be greater than age of insurance end.";
            let commonError2 = "Sum of minimum insurance age and maximum insurance period can't be greater than 101 year.";
            let errorsForField1 = []
            if (fieldName === "maximumInsurancePeriod") {
                if (updatedState.maximumInsurancePeriod !== "" && Number(updatedState.maximumInsurancePeriod) <= 0) {
                    newErrors[fieldName] = "Maximum insurance period must be greater than 0.";
                }
            } else if (fieldName === "insuranceStartAge") {
                if (updatedState.insuranceStartAge !== "" && updatedState.insuranceStartAge < 0) {
                    newErrors[fieldName] = "Age of insurance start can't be less than 0.";
                }
            } else {
                if (updatedState.insuranceEndAge !== "" && (updatedState.insuranceEndAge < 0 || updatedState.insuranceEndAge > 100)) {
                    newErrors[fieldName] = "Age of insurance end must between 0 and 100.";
                }
            }
            // TODO: redo it later because it is difficult to understand       
            fieldsToValidate = ["insuranceStartAge", "insuranceEndAge"];
            if (fieldsToValidate.includes(fieldName)) {
                console.log("error1")
                fieldsToValidate.forEach((v) => {
                    if (newErrors[v]?.includes(commonError)) {
                        newErrors[v] = newErrors[v].replace(commonError, "").trim() || null;
                    }
                });
                if (fieldsToValidate.every((v) => !newErrors[v] || newErrors[v] === commonError2)) {
                    if (fieldsToValidate.every((v) => updatedState[v] !== "") && (Number(updatedState.insuranceStartAge) > Number(updatedState.insuranceEndAge))) {
                        errorsForField1.push(commonError);
                    }
                }

            }
            fieldsToValidate = ["insuranceStartAge", "maximumInsurancePeriod"];
            if (fieldsToValidate.includes(fieldName)) {
                console.log("error2")
                fieldsToValidate.forEach((v) => {
                    if (newErrors[v]?.includes(commonError2)) {
                        newErrors[v] = newErrors[v].replace(commonError2, "").trim() || null;
                    }
                });
                if (fieldsToValidate.every((v) => !newErrors[v] || newErrors[v] === commonError)) {
                    if (fieldsToValidate.every((v) => updatedState[v] !== "") && (Number(updatedState.maximumInsurancePeriod) + Number(updatedState.insuranceStartAge) > 101)) {
                        errorsForField1.push(commonError2);
                    }
                }
            }
            if (errorsForField1.length !== 0) {
                newErrors[fieldName] = errorsForField1.join("\n");
            }
        } else if (["birthDate", "insuranceStartDate", "insurancePeriodYears", "insurancePeriodMonths", "reservePeriodYears", "reservePeriodMonths"].includes(fieldName)) {
            if (fieldName === "insuranceStartDate" || fieldName === "birthDate") {
                commonError = "Birth date can't be later than insurance start date.";
                fieldsToValidate = ["insuranceStartDate", "birthDate"];
                fieldsToValidate.forEach((v) => {
                    if (newErrors[v] === commonError) {
                        newErrors[v] = null;
                    }
                })
                if (fieldName === "birthDate") {
                    if (updatedState.birthDate !== "" && Date.parse(updatedState.birthDate) > currentDate) {
                        newErrors[fieldName] = "Birth date can't be later than current moment.";
                    }
                }
                if (!newErrors.insuranceStartDate && !newErrors.birthDate) {
                    if (fieldsToValidate.every((v) => updatedState[v] !== "") && Date.parse(updatedState.birthDate) > Date.parse(updatedState.insuranceStartDate)) {
                        newErrors[fieldName] = commonError;
                    }
                }
            } else if (fieldName === "insurancePeriodYears" || fieldName === "insurancePeriodMonths") {
                commonError = "Insurance period must be greater than 0.";
                fieldsToValidate = ["insurancePeriodYears", "insurancePeriodMonths"];
                fieldsToValidate.forEach((v) => {
                    if (newErrors[v] === commonError) {
                        newErrors[v] = null;
                    }
                });
                if (fieldName === "insurancePeriodYears") {
                    if (updatedState.insurancePeriodYears !== "" && updatedState.insurancePeriodYears < 0) {
                        newErrors[fieldName] = "Number of years in insurance period years can't be less than 0.";
                    }
                } else {
                    if (updatedState.insurancePeriodMonths !== "" && (updatedState.insurancePeriodMonths < 0 || updatedState.insurancePeriodMonths > 11)) {
                        newErrors[fieldName] = "Number of months in insurance period must be between 0 and 11.";
                    }
                }
                if (!newErrors.insurancePeriodYears && !newErrors.insurancePeriodMonths) {
                    fieldsToValidate = ["insurancePeriodYears", "insurancePeriodYears"];
                    if (fieldsToValidate.every((v) => updatedState[v] !== "") && (Number(updatedState.insurancePeriodYears) === 0 && Number(updatedState.insurancePeriodMonths) === 0)) {
                        newErrors[fieldName] = commonError;
                    }
                }
            } else {
                commonError = "Period from insurance start to reserve calculation must be greater than 0.";
                fieldsToValidate = ["reservePeriodYears", "reservePeriodMonths"];
                fieldsToValidate.forEach((v) => {
                    if (newErrors[v] === commonError) {
                        newErrors[v] = null;
                    }
                });
                if (fieldName === "reservePeriodYears") {
                    if (updatedState.reservePeriodYears !== "" && updatedState.reservePeriodYears < 0) {
                        newErrors[fieldName] = "Number of years in period from insurance start to reserve calculation can't be less than 0."
                    }
                } else {
                    if (updatedState.reservePeriodMonths !== "" && (updatedState.reservePeriodMonths < 0 || updatedState.reservePeriodMonths > 11)) {
                        newErrors[fieldName] = "Number of months in period from insurance start to reserve calculation must be between 0 and 11."
                    }
                }
                if (!newErrors.reservePeriodYears && !newErrors.reservePeriodMonths) {
                    if (fieldsToValidate.every((v) => updatedState[v] !== "") && (Number(updatedState.reservePeriodYears) === 0 && Number(updatedState.reservePeriodMonths) === 0)) {
                        newErrors[fieldName] = commonError;
                    }
                }
            }

            // TODO: redo it later because it is difficult to understand
            let errorsForField = []
            const commonReserveError = "Period from insurance start to reserve calculation must be less than insurance period.";
            const commonAgeError = "Age of insured person at the end of insurance period can't be more than 101.";
            fieldsToValidate = ["birthDate", "insuranceStartDate", "insurancePeriodYears", "insurancePeriodMonths"];
            if (fieldsToValidate.includes(fieldName) && updatedState.insuranceType !== "чисто накопительное страхование") {
                fieldsToValidate.forEach((v) => {
                    if (newErrors[v]?.includes(commonAgeError)) {
                        newErrors[v] = newErrors[v].replace(commonAgeError, "").trim() || null;
                    }
                })
                const dateDifference = moment.duration(moment(Date.parse(updatedState.insuranceStartDate)).diff(moment(Date.parse(updatedState.birthDate))));
                const endAge = 12 * (dateDifference.years() + Number(updatedState.insurancePeriodYears)) + dateDifference.months() + Number(updatedState.insurancePeriodMonths)
                console.log("endAge", endAge)
                if (fieldsToValidate.every((v) => !newErrors[v] || newErrors[v] === commonReserveError)) {
                    if (fieldsToValidate.every((v) => updatedState[v] !== "") && (endAge > 1212 || (endAge === 1212 && dateDifference.days() !== 0))) {
                        errorsForField.push(commonAgeError);
                    }
                }
            }

            fieldsToValidate = ["reservePeriodYears", "reservePeriodMonths", "insurancePeriodYears", "insurancePeriodMonths"];
            if (fieldsToValidate.includes(fieldName)) {
                fieldsToValidate.forEach((v) => {
                    if (newErrors[v]?.includes(commonReserveError)) {
                        newErrors[v] = newErrors[v].replace(commonReserveError, "").trim() || null;
                    }
                })
                if (fieldsToValidate.every((v) => !newErrors[v] || newErrors[v] === commonAgeError)) {
                    if (fieldsToValidate.every((v) => updatedState[v] !== "") && (12 * Number(updatedState.reservePeriodYears) + Number(updatedState.reservePeriodMonths)) >= (12 * Number(updatedState.insurancePeriodYears) + Number(updatedState.insurancePeriodMonths))) {
                        errorsForField.push(commonReserveError)
                    }
                }
            }

            if (errorsForField.length !== 0) {
                newErrors[fieldName] = errorsForField.join("\n");
            }
        }
        this.setState({ errors: newErrors })
        this.props.updateStoredState("errors", newErrors);
    }



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
                case "insurancePremium":
                    requestData.insuranceSum = this.state.insuranceSum;
                    break;
                case "insuranceSum":
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
            if (this.state.insuranceType !== "чисто накопительное страхование") {
                requestData.maximumInsurancePeriod = 12 * Number(this.state.maximumInsurancePeriod);
            } else {
                requestData.maximumInsurancePeriod = 12 * Number(this.state.maximumInsurancePeriodYears) + Number(this.state.maximumInsurancePeriodMonths);
            }
        }

        const requestParameters = target !== "tariffs" ? null : { responseType: "blob" }
        try {
            const response = await axios.post(API_URL + routeDictionary[target], requestData, requestParameters);
            if (target !== "tariffs") {
                let value = response.data.result;
                this.setState({ result: value });
                this.props.updateStoredState("result", value);
            } else {
                const blob = new Blob([response.data], { type: response.headers["content-type"] });
                saveAs(blob, "tariffs.xlsx");

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
        if (!e.target.validity.valid) {
            return;
        }
        const { name, value } = e.target;
        // console.log(value);
        // console.log(Number(value));
        // console.log(typeof value);
        let updatedState = { ...this.state, [name]: value }
        this.validate(name, updatedState)
        // this.toggleButton(updatedState);
        this.setState({
            [name]: value
        });
        this.props.updateStoredState(name, value);
    }

    componentDidUpdate() {
        this.toggleButton();
    }

    componentDidMount() {
        this.toggleButton();
    }

    render() {
        const { target } = this.props;
        const { errors } = this.state;
        // console.log("rerendering")
        // console.log(errors);

        const targetDictionary = {
            "insurancePremium": "Cтраховой взнос=",
            "insuranceSum": "Cтраховая сумма=",
            "reserve": "Резерв="
        }

        return (
            <div className="App">
                <form onSubmit={this.handleSubmit} noValidate>
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
                                        <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name="insuranceStartAge" value={this.state.insuranceStartAge} onChange={this.handleChange} />
                                        {errors.insuranceStartAge && <div className="error">{errors.insuranceStartAge}</div>}
                                    </FiedlGroup>
                                    <FiedlGroup labelText="Введите конечный возраст страхования в годах:">
                                        <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name="insuranceEndAge" value={this.state.insuranceEndAge} onChange={this.handleChange} />
                                        {errors.insuranceEndAge && <div className="error">{errors.insuranceEndAge}</div>}
                                    </FiedlGroup>
                                </React.Fragment>
                            )}

                            {this.state.insuranceType !== "пожизненное страхование" && (
                                this.state.insuranceType !== "чисто накопительное страхование" ? (
                                    <FiedlGroup labelText="Введите максимальный период страхования в годах:">
                                        <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name="maximumInsurancePeriod" value={this.state.maximumInsurancePeriod} onChange={this.handleChange} />
                                        {errors.maximumInsurancePeriod && <div className="error">{errors.maximumInsurancePeriod}</div>}
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
                                        {errors.birthDate && <div className="error">{errors.birthDate}</div>}
                                    </FiedlGroup>
                                    <FiedlGroup labelText="Введите дату начала страхования:">
                                        <input type="date" name="insuranceStartDate" value={this.state.insuranceStartDate} onChange={this.handleChange} />
                                        {errors.insuranceStartDate && <div className="error">{errors.insuranceStartDate}</div>}
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
                        <input type="text" inputMode="numeric" pattern={inputFloatPattern} name="insurancePremiumRate" value={this.state.insurancePremiumRate} onChange={this.handleChange} />
                        {errors.insurancePremiumRate && <div className="error">{errors.insurancePremiumRate}</div>}
                    </FiedlGroup>
                    <FiedlGroup labelText="Введите нагрузку:">
                        <input type="text" inputMode="numeric" pattern={inputFloatPattern} name="insuranceLoading" value={this.state.insuranceLoading} onChange={this.handleChange} />
                        {errors.insuranceLoading && <div className="error">{errors.insuranceLoading}</div>}
                    </FiedlGroup>
                    {(target === "insuranceSum") && (
                        <FiedlGroup labelText="Введите страховой взнос:">
                            <input type="text" inputMode="numeric" pattern={inputFloatPattern} name="insurancePremium" value={this.state.insurancePremium} onChange={this.handleChange} />
                            {errors.insurancePremium && <div className="error">{errors.insurancePremium}</div>}
                        </FiedlGroup>
                    )}
                    {(target === "insurancePremium") && (
                        <FiedlGroup labelText="Введите страховую сумму:">
                            <input type="text" inputMode="numeric" pattern={inputFloatPattern} name="insuranceSum" value={this.state.insuranceSum} onChange={this.handleChange} />
                            {errors.insuranceSum && <div className="error">{errors.insuranceSum}</div>}
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
                                    inputMode="numeric"
                                    pattern={inputFloatPattern}
                                    name="insurancePremium"
                                    value={this.state.insurancePremium}
                                    onChange={this.handleChange}
                                    disabled={this.state.inputVariable !== "insurancePremium"}
                                />
                                {errors.insurancePremium && <div className="error">{errors.insurancePremium}</div>}
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
                                    inputMode="numeric"
                                    pattern={inputFloatPattern}
                                    name="insuranceSum"
                                    value={this.state.insuranceSum}
                                    onChange={this.handleChange}
                                    disabled={this.state.inputVariable !== "insuranceSum"}
                                />
                                {errors.insuranceSum && <div className="error">{errors.insuranceSum}</div>}
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
                    <button type="submit" disabled={!this.state.isButtonActive} className={!this.state.isButtonActive ? "disabled" : null}>Вычислить</button>
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