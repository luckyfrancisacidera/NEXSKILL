import {Table,TableBody,TableCell,TableHead,TableHeadCell,TableRow,} from "flowbite-react";

const CandidateTable = () => {
  return (
    <div className="overflow-x-auto">
      <Table className="!bg-transparent">
       
        <TableBody className="divide-y divide-gray-200">
          <TableRow className="!bg-transparent hover:!bg-gray-100">
            <TableCell className="!bg-transparent">
              <input type="checkbox" />
            </TableCell>

            <TableCell className="!bg-transparent">
              <div className="font-semibold text-black">
                Baldwin Cunningham
              </div>
              <div className="text-sm text-gray-500">
                Previous: Tech Solutions Inc.
              </div>
            </TableCell>

            <TableCell className="!bg-transparent text-black">
              Sales Engineer
            </TableCell>
            <TableCell className="!bg-transparent text-black">
              Full-time
            </TableCell>
            <TableCell className="!bg-transparent text-black">
              New York
            </TableCell>
            <TableCell className="!bg-transparent text-black">
              Feb 20, 2026
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default CandidateTable;