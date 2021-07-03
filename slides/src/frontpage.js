import React from 'react'

const Frontpage = ({ children }) => (
  <div
    style={{
      // width: '100vw',
      // height: '60vw',
      backgroundColor: 'rgb(1, 22, 39)',
      opacity: 0.8,
      padding: 20,
      verticalAlign: "middle",
    }}
  >
    {children}
  </div>
)

export default Frontpage
