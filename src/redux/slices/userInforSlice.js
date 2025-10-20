import {createSlice} from '@reduxjs/toolkit';

const userInforSlice = createSlice({
    name: "userInfor",
    initialState: {
        userInfor: {
            dataInfor: null,
            isFetching: false,
            error: false,
        },
        message: {
            text: "",
            type: "",             
        }
    
    },

    reducers: {
        //get user infor
        getUserInforStart: (state) => {
            state.userInfor.isFetching = true;


        },
        getUserInforSuccess: (state, action) => {
            state.userInfor.isFetching = false;
            state.userInfor.dataInfor = action.payload;
            state.userInfor.error = false;
        },
        getUserInforFailure: (state) => {
            state.userInfor.isFetching = false;
            state.userInfor.error = true;
        },
        //update user infor
        updateInforStart: (state) => {
            state.userInfor.isFetching = true;
        },
        updateInforSuccess: (state, action) => {
            state.userInfor.isFetching = false;
            state.message.text = action.payload.message || "User information updated successfully";
            state.message.type = "success";
            state.userInfor.error = false;
        },
        updateInforFailure: (state) => {
            state.userInfor.isFetching = false;
            state.message.text = "Failed to update user information";
            state.message.type = "error";
            state.userInfor.error = true;
        }
    }


}) 
export const {
    getUserInforStart,
    getUserInforSuccess,
    getUserInforFailure,
    updateInforStart,
    updateInforSuccess,
    updateInforFailure
} = userInforSlice.actions;

export default userInforSlice.reducer;