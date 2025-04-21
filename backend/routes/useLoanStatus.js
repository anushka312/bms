import { useEffect, useState } from 'react';
import axios from 'axios';

const useLoanStatus = (customerId) => {
  const [hasLoan, setHasLoan] = useState(false);

  useEffect(() => {
    if (!customerId) return;

    const fetchLoanStatus = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/loan/exists/${customerId}`);
        setHasLoan(res.data.hasLoan);
      } catch (err) {
        console.error('Failed to fetch loan status:', err);
        setHasLoan(false);
      }
    };

    fetchLoanStatus();
  }, [customerId]);

  return hasLoan;
};

export default useLoanStatus;
