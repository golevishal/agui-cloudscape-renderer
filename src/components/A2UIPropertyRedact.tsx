import { ExpandableSection, Box, Container } from '@cloudscape-design/components';
import type { A2UIPropertyRedactPayload } from '../types/agui';

interface A2UIPropertyRedactProps {
  payload: A2UIPropertyRedactPayload;
}

export default function A2UIPropertyRedact({ payload }: A2UIPropertyRedactProps) {
  return (
    <Container>
      <ExpandableSection
        headerText={payload.label || 'Sensitive Data (Click to Reveal)'}
        defaultExpanded={false}
      >
        <Box padding={{ top: 'xs', bottom: 'xs' }}>
           <Box variant="code" display="block">
             {payload.content}
           </Box>
        </Box>
      </ExpandableSection>
    </Container>
  );
}
