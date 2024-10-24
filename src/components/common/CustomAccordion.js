import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";

export default function CustomAccordion({
  panels, // 아코디언 패널 정보 배열
  defaultExpanded, // 기본적으로 확장될 패널의 ID (선택적)
}) {
  return (
    <div>
      {panels.map((panel, index) => (
        <Accordion key={index} defaultExpanded={panel.id === defaultExpanded}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${panel.id}-content`}
            id={`panel${panel.id}-header`}
          >
            {panel.title}
          </AccordionSummary>
          <AccordionDetails>{panel.content}</AccordionDetails>
          {panel.actions && (
            <AccordionActions>
              {panel.actions.map((action, idx) => (
                <Button
                  key={idx}
                  variant={action.variant || "text"}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </AccordionActions>
          )}
        </Accordion>
      ))}
    </div>
  );
}
