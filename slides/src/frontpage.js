import React from 'react'

const Frontpage = ({ children }) => (
  <div
    style={{
      width: '75vw',
      height: '33vw',
      backgroundColor: 'rgb(1, 22, 39)',
      opacity: 0.85,
      padding: 10,
    }}
  >
    {children}
  </div>
)

export default Frontpage
