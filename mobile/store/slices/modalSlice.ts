import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  showCreatePortfolio: boolean;
  showKycModal: boolean;
}

const initialState: ModalState = {
  showCreatePortfolio: false,
  showKycModal: false,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    setShowCreatePortfolio(state, action: PayloadAction<boolean>) {
      state.showCreatePortfolio = action.payload;
      if (action.payload) state.showKycModal = false; // Only one modal at a time
    },
    setShowKycModal(state, action: PayloadAction<boolean>) {
      state.showKycModal = action.payload;
      if (action.payload) state.showCreatePortfolio = false; // Only one modal at a time
    },
    resetModals(state) {
      state.showCreatePortfolio = false;
      state.showKycModal = false;
    },
  },
});

export const { setShowCreatePortfolio, setShowKycModal, resetModals } = modalSlice.actions;
export default modalSlice.reducer; 