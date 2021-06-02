import React from 'react'

const Wrapper = styled.main`
  font-size: 150px;

`


const LargeEmoji = ({ children }) => (
  <Fragment>
    <Wrapper>{children}</Wrapper>
  </Fragment>
)

export default LargeEmoji
