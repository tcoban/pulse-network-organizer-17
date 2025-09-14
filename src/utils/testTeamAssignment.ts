import { supabase } from '@/integrations/supabase/client';

/**
 * Test utility to demonstrate the team assignment functionality
 */
export const testTeamAssignment = async () => {
  try {
    console.log('🎯 Testing Swiss Team Assignment System...');
    
    // Get sample of contacts to show assignment logic
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select(`
        id,
        name,
        email,
        company,
        position,
        assigned_to,
        contact_tags (tag),
        team_members!contacts_assigned_to_team_members_fkey (
          first_name,
          last_name,
          department,
          role
        )
      `)
      .limit(20);

    if (error) {
      console.error('Error fetching contacts:', error);
      return;
    }

    if (!contacts) {
      console.log('No contacts found');
      return;
    }

    console.log('\n📊 Contact Assignment Report:');
    console.log('=' .repeat(60));

    contacts.forEach((contact, index) => {
      const assignedMember = contact.team_members;
      const assignedName = assignedMember && Array.isArray(assignedMember) && assignedMember.length > 0
        ? `${assignedMember[0].first_name} ${assignedMember[0].last_name}`.trim()
        : assignedMember && !Array.isArray(assignedMember)
        ? `${(assignedMember as any).first_name} ${(assignedMember as any).last_name}`.trim()
        : 'Unassigned';
      
      const tags = contact.contact_tags?.map((tag: any) => tag.tag).join(', ') || 'No tags';
      
      console.log(`\n${index + 1}. ${contact.name}`);
      console.log(`   📧 ${contact.email}`);
      console.log(`   🏢 ${contact.company || 'N/A'}`);
      console.log(`   💼 ${contact.position || 'N/A'}`);
      console.log(`   🏷️  Tags: ${tags}`);
      console.log(`   👤 Assigned to: ${assignedName}`);
    });

    // Show assignment statistics
    const assignedCount = contacts.filter(c => c.assigned_to).length;
    const unassignedCount = contacts.length - assignedCount;
    
    console.log('\n📈 Assignment Statistics:');
    console.log(`   ✅ Assigned: ${assignedCount}/${contacts.length}`);
    console.log(`   ❌ Unassigned: ${unassignedCount}/${contacts.length}`);
    console.log(`   📊 Assignment Rate: ${((assignedCount / contacts.length) * 100).toFixed(1)}%`);

    // Show team member distribution
    const teamDistribution: { [key: string]: number } = {};
    contacts.forEach(contact => {
      const member = contact.team_members;
      if (member) {
        const memberData = Array.isArray(member) ? member[0] : member as any;
        if (memberData && memberData.first_name && memberData.last_name) {
          const name = `${memberData.first_name} ${memberData.last_name}`.trim();
          teamDistribution[name] = (teamDistribution[name] || 0) + 1;
        }
      }
    });

    console.log('\n👥 Team Member Distribution:');
    Object.entries(teamDistribution)
      .sort(([,a], [,b]) => b - a)
      .forEach(([name, count]) => {
        console.log(`   ${name}: ${count} contacts`);
      });

    console.log('\n✨ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  }
};