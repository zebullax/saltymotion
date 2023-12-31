// React
import React from "react";
// Mui
import Typography from "@mui/material/Typography";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import Grid from "@mui/material/Grid";

/**
 * Render a dialog with terms of use
 * @return {JSX.Element}
 * @constructor
 */
export default function TermsOfUse() {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography variant="h3" style={{ paddingBottom: 16 }}>
          Website Terms and Conditions of Use
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Terms</Typography>
        <Typography variant="body2">
          By accessing this Website, accessible from https://saltymotion.com, you are agreeing to be bound by these
          Website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable
          local laws. If you disagree with any of these terms, you are prohibited from accessing this site. The
          materials contained in this Website are protected by copyright and trade mark law. These Terms of Service has
          been created with the help of the
          <a href="https://www.termsofservicegenerator.net">Terms of Service Generator</a> and the
          <a href="https://www.termsconditionsexample.com">Terms & Conditions Example</a>.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Use License</Typography>
        <Typography variant="body2">
          Permission is granted to temporarily download one copy of the materials on Saltymotion's Website for personal,
          non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under
          this license you may not:
        </Typography>
        <List>
          <ListItemText inset primary="modify or copy the materials" />
          <ListItemText inset primary="use the materials for any commercial purpose or for any public display" />
          <ListItemText inset primary="attempt to reverse engineer any software contained on Saltymotion's Website" />
          <ListItemText inset primary="remove any copyright or other proprietary notations from the materials or" />
          <ListItemText
            inset
            primary='transferring the materials to another person or "mirror" the materials on any other server.'
          />
        </List>
        <Typography variant="body2">
          This will let Saltymotion to terminate upon violations of any of these restrictions. Upon termination, your
          viewing right will also be terminated and you should destroy any downloaded materials in your possession
          whether it is printed or electronic format.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Disclaimer</Typography>
        <Typography variant="body2">
          All the materials on Saltymotion’s Website are provided "as is". Saltymotion makes no warranties, may it be
          expressed or implied, therefore negates all other warranties. Furthermore, Saltymotion does not make any
          representations concerning the accuracy or reliability of the use of the materials on its Website or otherwise
          relating to such materials or any sites linked to this Website.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Limitations</Typography>
        <Typography variant="body2">
          Saltymotion or its suppliers will not be hold accountable for any damages that will arise with the use or
          inability to use the materials on Saltymotion’s Website, even if Saltymotion or an authorize representative of
          this Website has been notified, orally or written, of the possibility of such damage. Some jurisdiction does
          not allow limitations on implied warranties or limitations of liability for incidental damages, these
          limitations may not apply to you.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Revisions and Errata</Typography>
        <Typography variant="body2">
          The materials appearing on Saltymotion’s Website may include technical, typographical, or photographic errors.
          Saltymotion will not promise that any of the materials in this Website are accurate, complete, or current.
          Saltymotion may change the materials contained on its Website at any time without notice. Saltymotion does not
          make any commitment to update the materials.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Links</Typography>
        <Typography variant="body2">
          Saltymotion has not reviewed all of the sites linked to its Website and is not responsible for the contents of
          any such linked site. The presence of any link does not imply endorsement by Saltymotion of the site. The use
          of any linked website is at the user’s own risk.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Site Terms of Use Modifications</Typography>
        <Typography variant="body2">
          Saltymotion may revise these Terms of Use for its Website at any time without prior notice. By using this
          Website, you are agreeing to be bound by the current version of these Terms and Conditions of Use.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Your Privacy</Typography>
        <Typography variant="body2">Please read our Privacy Policy.</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Governing Law</Typography>
        <Typography variant="body2">
          Any claim related to Saltymotion's Website shall be governed by the laws of jp without regards to its conflict
          of law provisions.
        </Typography>
      </Grid>
    </Grid>
  );
}

TermsOfUse.propTypes = {};
