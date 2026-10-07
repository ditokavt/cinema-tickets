import StatePanel from '../components/ui/StatePanel.jsx';

export default function NotFound() {
  return (
    <div className="container-x pb-[120px] pt-[6px]">
      <h1 className="t-h1">Page not found</h1>
      <StatePanel title="There is nothing at this address" text="The link may be out of date." actionLabel="Back to home" to="/" className="mt-7" />
    </div>
  );
}
