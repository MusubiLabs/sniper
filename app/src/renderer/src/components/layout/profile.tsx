import { ConnectButton } from '@rainbow-me/rainbowkit';

// TODO:
// 1. Login button
// 2. Profile Button
export default function Profile() {
  return (
    <div>
      <ConnectButton chainStatus={'icon'} showBalance={false} />
    </div>
  );
}
