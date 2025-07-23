import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  showCreatePortfolio: boolean;
  showKycModal: boolean;
  showCreatePackage: boolean;
  showEditPackage: boolean;
}

const initialState: ModalState = {
  showCreatePortfolio: false,
  showKycModal: false,
  showCreatePackage: false,
  showEditPackage: false,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    setShowCreatePortfolio(state, action: PayloadAction<boolean>) {
      state.showCreatePortfolio = action.payload;
      if (action.payload) {
        state.showKycModal = false;
        state.showCreatePackage = false;
      }
    },
    setShowKycModal(state, action: PayloadAction<boolean>) {
      state.showKycModal = action.payload;
      if (action.payload) {
        state.showCreatePortfolio = false;
        state.showCreatePackage = false;
      }
    },
    setShowCreatePackage(state, action: PayloadAction<boolean>) {
      state.showCreatePackage = action.payload;
      if (action.payload) {
        state.showCreatePortfolio = false;
        state.showKycModal = false;
        state.showEditPackage = false;
      }
    },
    setShowEditPackage(state, action: PayloadAction<boolean>) {
      state.showEditPackage = action.payload;
      if (action.payload) {
        state.showCreatePortfolio = false;
        state.showKycModal = false;
        state.showCreatePackage = false;
      }
    },
    resetModals(state) {
      state.showCreatePortfolio = false;
      state.showKycModal = false;
      state.showCreatePackage = false;
      state.showEditPackage = false;
    },
  },
});

export const { setShowCreatePortfolio, setShowKycModal, setShowCreatePackage, setShowEditPackage, resetModals } = modalSlice.actions;
export default modalSlice.reducer; 