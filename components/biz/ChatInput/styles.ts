import styled, { css, keyframes } from 'styled-components';

const gradient = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 100em 0;
  }
`;

interface StyledChatInputProps {
  $loading?: boolean;
  $notActions?: boolean;
}

const loadingBackground = css`
  background: repeating-linear-gradient(
      101.79deg,
      rgb(255, 0, 0) 0%,
      rgb(128, 0, 128) 33%,
      rgb(0, 0, 255) 66%,
      rgb(0, 128, 0) 100%
    )
    0% 0% / 200% 200%;
  animation: ${gradient} 6s linear infinite;
`;

export const StyledChatInput = styled.div<StyledChatInputProps>`
  position: relative;
  width: 100%;
  background: ${({ $loading }) => ($loading ? 'none' : '#1f1f1f')};
  ${({ $loading }) => $loading && loadingBackground};
  background-size: 200% 200%;
  border-radius: 8px;
  padding: 2px;

  textarea {
    position: relative;
    transition: 0.3s;
    padding-right: 50px;
    padding-top: ${({ $notActions }) => ($notActions ? '10px' : '48px')};
    padding-bottom: 10px;
    background: #2b2b2b;
    color: #e0e0e0;
    border: 1px solid #383838;

    &::placeholder {
      color: #666666;
    }
    &:hover {
      border-color: #505050;
      background: #333333;
    }
    &:focus {
      border-color: #606060;
      background: #333333;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
    }
  }

  .generate-btn {
    position: absolute;
    right: 12px;
    bottom: 12px;
  }

  .action-wrapper {
    position: absolute;
    top: 3px;
    height: 45px;
    left: 4px;
    right: 4px;
    padding: 0 12px;
    border-radius: 8px 8px 0 0;
    display: ${({ $notActions }) => ($notActions ? 'none' : 'flex')};
    align-items: center;
    background: #2b2b2b;
  }

  .image-wrapper {
    margin-top: 5px;
  }
`;
