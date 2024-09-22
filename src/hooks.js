import React from 'react';

function useToggleButton(input, errors, getExcludedFields) {
    const [isButtonActive, setIsButtonActive] = React.useState(false);
    React.useLayoutEffect(() => {
        // skip initial rendering
        if (input !== null) {
            const allFields = Object.keys(input);
            let buttonState = false;
            let excludedFields = getExcludedFields(input);
                       
            const trackedFields = allFields.filter((v) => !excludedFields.includes(v));   
            if (trackedFields.every((v) => input[v] !== "") && trackedFields.every((v) => errors[v].fieldErrors.every((e)=> e.excludedInsuranceTypes.includes(input.insuranceType)))) {       
                buttonState = true;
            }
            setIsButtonActive(buttonState);
        }      
    }, [input, errors, getExcludedFields])
    return isButtonActive;
}

export {useToggleButton};