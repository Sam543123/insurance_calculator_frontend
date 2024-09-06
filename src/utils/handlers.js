
const commonHandleInput = (e, state, setState) => {
    // if (!e.target.validity.valid) {
    //   return;
    // }
    const { name, value } = e.target;
    setState({
      ...state,
      [name]: value
    });
  }

export {commonHandleInput};
