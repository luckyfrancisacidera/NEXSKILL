import { Accordion, AccordionContent, AccordionPanel, AccordionTitle } from "flowbite-react";

const CandidateSidebar: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Accordion className="!bg-transparent !border-none">
        <AccordionPanel className="!bg-transparent  hover:!bg-gray-100 focus:!ring-0 focus:!outline-none">
          <AccordionTitle className="!bg-transparent !h-5 !border-b-3 border-gray-300 !py-6
           !text-black focus:!ring-0 focus:!outline-none">
            Account Executive
          </AccordionTitle>
          <AccordionContent className="!bg-transparent !text-black !border-none">
            The content is this
          </AccordionContent>
        </AccordionPanel>
      </Accordion>

      
    </div>
  );
};

export default CandidateSidebar;