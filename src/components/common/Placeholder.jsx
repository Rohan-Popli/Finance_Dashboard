import React from 'react';

const Placeholder = ({ name }) => {
  return (
    <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center text-secondary">
      {name || 'Component'} Placeholder
    </div>
  );
};

export default Placeholder;
