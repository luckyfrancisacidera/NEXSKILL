import { CandidateSidebar, CandidateSummary } from '@features/candidates'
const CandidateLayout: React.FC = () => {
  return (
    <div className="grid grid-cols-[23%_77%] ">
      {/* Side bar */}
      <div className="bg-gray-100 w-full h-screen p-4">
        <CandidateSidebar />
      </div>

      {/* Main Content */}
      <div className="w-full h-screen p-7">
        <CandidateSummary></CandidateSummary>
      </div>
    </div>
  );
};
export default CandidateLayout;
